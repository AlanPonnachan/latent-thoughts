---
title: "Adding a Native CLAHE Preprocessing Layer to Keras 3"
description: "How I contributed Contrast Limited Adaptive Histogram Equalization to Keras using pure backend-agnostic tensor operations."
date: "2024-04-10"
series: "upstream-dynamics"
order: 1
readingTime: 8
---

If you are training computer vision models on medical images, satellite imagery, or low-light photography, you frequently deal with low-contrast datasets. Feeding these raw images into a neural network often leads to poor feature extraction.

Recently, I contributed a new preprocessing layer to the Keras repository (PR #21953) to address this: `ContrastLimitedAdaptiveHistogramEqualization`, or **CLAHE**.

While you can run CLAHE using OpenCV, adding it as a native Keras layer means it becomes part of the computational graph. It runs natively using tensor operations across all Keras 3 backends (TensorFlow, JAX, and PyTorch), and it gets exported inside your model for inference without requiring external dependencies.

Before diving into the code and how it was implemented, let's look at how the algorithm actually works.

### Why Global Histogram Equalization Falls Short

The standard approach to fixing low-contrast images is Global Histogram Equalization (HE). It calculates the distribution of pixel intensities across the entire image and stretches them to use the full 0-255 range. 

While the concept is simple, the results are often counterproductive. If an X-Ray has a large dark background, Global HE applies the exact same transformation everywhere. It aggressively stretches those dark background pixels, heavily amplifying background noise while washing out the actual bone structures.

We need to enhance contrast locally. 

### How CLAHE Works: The Mechanism

The CLAHE algorithm has three major parts: tile generation, histogram equalization, and bilinear interpolation. Here is exactly what happens to an image passing through the algorithm:

**1. Tile Generation**
The input image is first divided into uniformly sized sections. Each section is called a tile. By operating on these small tiles (typically an 8x8 grid), the algorithm can adapt to the local lighting conditions of specific areas in the image.

```component
ClaheTileSplit
```

**2. Histogram Equalization (with a Clip Limit)**
Histogram equalization is then performed independently on each tile. This process consists of five specific steps:
*   **Histogram Computation:** The pixel intensity histogram is computed as a set of bins for each tile.
*   **Excess Calculation:** We introduce a predefined `clip_limit`. If a tile has a very uniform area (like a solid background), it will have a massive spike in its histogram. We identify any histogram bin values that are higher than this clip limit.
*   **Excess Distribution & Redistribution:** We don't discard those clipped values. The accumulated excess pixels are distributed evenly into all the other bins of the histogram. This strictly limits contrast over-amplification (preventing noise) while maintaining the tile's brightness.

```component
ClaheHistogram
```

*   **Scaling and Mapping:** A Cumulative Distribution Function (CDF) is then calculated for the newly adjusted histogram. The CDF acts as a lookup table. The original pixel values of the tile are passed through this CDF to scale and map them to their new, equalized values.

**3. Bilinear Interpolation**
If we just merged the tiles back together now, the image would look like a checkerboard because neighboring tiles used completely different CDF mappings. To fix this, the resulting tiles are stitched together using bilinear interpolation. This smooths out the contrast differences between regions, generating an output image with improved contrast and zero artificial boundaries.

```component
ClaheInterpolation
```

### Implementing CLAHE in Keras (PR #21953)

Translating this algorithm from a theoretical mechanism into Keras 3 required relying strictly on `keras.src.backend` operations to ensure it worked perfectly across TensorFlow, JAX, and PyTorch. 

During the PR implementation, I ran into a few interesting engineering challenges:

**Handling Odd Image Sizes (The Padding Logic)**
In theory, tiles perfectly divide an image. In practice, image dimensions are rarely perfectly divisible by the grid size. If you have a 500x500 image, how do you divide it cleanly into an 8x8 grid? 
In Keras, I handled this by calculating the required mathematical padding (`pad_h`, `pad_w`). Before tile generation, the layer applies symmetric padding to the image edges so it divides perfectly. After the algorithm finishes, we simply crop the padded areas back out.

**The Tensor Trick for Local Histograms**
In standard Python, computing histograms is as easy as calling `numpy.histogram()`. In a tensor graph, computing batched, localized histograms dynamically is trickier. 

To solve this efficiently for GPUs without using slow loops, the layer leverages `backend.nn.one_hot`. After reshaping the image into flat tiles and casting the pixels to integers, we apply a one-hot encoding over the 256 possible pixel values. By summing over the pixel axis, we instantly get the exact bin counts for every tile in the entire batch simultaneously:

```python
# Flattened tiles shape: (batch, grid_h, grid_w, channels, tile_pixels)
tiled_int = self.backend.cast(tiled_flat, "int32")
tiled_int = self.backend.numpy.clip(tiled_int, 0, 255)

# Compute histograms via one_hot and sum simultaneously across the batch
hists = self.backend.numpy.sum(
    self.backend.nn.one_hot(tiled_int, 256), axis=-2
)
```
*(Note: Because `one_hot` expands the tensor by a factor of 256, this operation can be memory-intensive for very high-resolution images or massive batch sizes).*

**Vectorized Bilinear Interpolation**
Rather than writing complex nested loops for the stitching phase, the code computes a continuous grid of coordinates `(y_grid, x_grid)`, calculates the fractional distances to the nearest tile centers, and uses flat tensor indexing (`backend.numpy.take`) to pull the four neighbor values simultaneously. This keeps the interpolation phase highly parallelized.

### Usage and Results

Using the new layer is straightforward. It accepts a `data_format` argument (`"channels_last"` or `"channels_first"`), making it easy to drop into an existing `keras.Sequential` pipeline.

```python
import os
os.environ["KERAS_BACKEND"] = "tensorflow" # Works with JAX and PyTorch natively!
import keras
import cv2
import numpy as np
import requests

# 1. Download a low-contrast image
url = "https://upload.wikimedia.org/wikipedia/commons/a/a1/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg"
response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
img_array = np.asarray(bytearray(response.content), dtype="uint8")
img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)
img = cv2.resize(img, (512, 512))

# 2. Standard HE for comparison
img_standard_he = cv2.equalizeHist(img)

# 3. Keras CLAHE
clahe_layer = keras.layers.ContrastLimitedAdaptiveHistogramEqualization(
    value_range=(0, 255), 
    clip_limit=3.0, 
    tile_grid_size=(8, 8), 
    data_format="channels_last"
)

img_tensor = np.expand_dims(img, axis=(0, -1)).astype(np.float32)
img_keras_clahe = np.squeeze(np.array(clahe_layer(img_tensor))).astype(np.uint8)
```

Running this on a standard X-Ray highlights the difference clearly:

![CLAHE Comparison](/images/slide_comparison_layout.png "Original vs Global HE vs CLAHE")

Looking at the histograms:
*   **Original:** The pixel intensities are bunched up, resulting in a dark, low-contrast image.
*   **Global HE:** The intensities are forced aggressively across the entire spectrum. The uniform dark background gets stretched out unnecessarily, resulting in heavy noise and washed-out lung details.
*   **Keras CLAHE:** The histogram is balanced but strictly controlled. The noise in the homogeneous regions is suppressed, while the actual bone structures are sharpened perfectly for feature extraction.

### Summary

Adding operations like CLAHE directly into the model graph ensures consistency between training and inference. You don't need to worry about perfectly matching your inference environment's preprocessing to your training script—the transformation logic is baked directly into the model architecture.

You can view the full source code and tests for the layer in [Keras PR #21953](https://github.com/keras-team/keras/pull/21953).