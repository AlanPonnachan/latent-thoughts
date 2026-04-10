const e=`---\r
title: "Adding a Native CLAHE Preprocessing Layer to Keras 3"\r
description: "How I contributed Contrast Limited Adaptive Histogram Equalization to Keras."\r
date: "2026-04-10"\r
series: "patch-notes"\r
order: 1\r
readingTime: 8\r
---\r
\r
If you are training computer vision models on medical images, satellite imagery, or low-light photography, you frequently deal with low-contrast datasets. Feeding these raw images into a neural network often leads to poor feature extraction.\r
\r
Recently, I contributed a new preprocessing layer to the Keras repository ([Keras PR #21953](https://github.com/keras-team/keras/pull/21953)) to address this: \`ContrastLimitedAdaptiveHistogramEqualization\`, or **CLAHE**.\r
\r
While you can run CLAHE using OpenCV, adding it as a native Keras layer means it becomes part of the computational graph. It runs natively using tensor operations across all Keras 3 backends (TensorFlow, JAX, and PyTorch), and it gets exported inside your model for inference without requiring external dependencies.\r
\r
Before diving into the code and how it was implemented, let's look at how the algorithm actually works.\r
\r
### Why Global Histogram Equalization Falls Short\r
\r
The standard approach to fixing low-contrast images is Global Histogram Equalization (HE). It calculates the distribution of pixel intensities across the entire image and stretches them to use the full 0-255 range. \r
\r
While the concept is simple, the results are often counterproductive. If an X-Ray has a large dark background, Global HE applies the exact same transformation everywhere. It aggressively stretches those dark background pixels, heavily amplifying background noise while washing out the actual bone structures.\r
\r
We need to enhance contrast locally. \r
\r
### How CLAHE Works\r
\r
The CLAHE algorithm has three major parts: tile generation, histogram equalization, and bilinear interpolation. Here is exactly what happens to an image passing through the algorithm:\r
\r
**1. Tile Generation**\r
The input image is first divided into uniformly sized sections. Each section is called a tile. By operating on these small tiles (typically an 8x8 grid), the algorithm can adapt to the local lighting conditions of specific areas in the image.\r
\r
\`\`\`component\r
ClaheTileSplit\r
\`\`\`\r
\r
**2. Histogram Equalization (with a Clip Limit)**\r
Histogram equalization is then performed independently on each tile. This process consists of five specific steps:\r
*   **Histogram Computation:** The pixel intensity histogram is computed as a set of bins for each tile.\r
*   **Excess Calculation:** We introduce a predefined \`clip_limit\`. If a tile has a very uniform area (like a solid background), it will have a massive spike in its histogram. We identify any histogram bin values that are higher than this clip limit.\r
*   **Excess Distribution & Redistribution:** We don't discard those clipped values. The accumulated excess pixels are distributed evenly into all the other bins of the histogram. This strictly limits contrast over-amplification (preventing noise) while maintaining the tile's brightness.\r
\r
\`\`\`component\r
ClaheHistogram\r
\`\`\`\r
\r
*   **Scaling and Mapping:** A Cumulative Distribution Function (CDF) is then calculated for the newly adjusted histogram. The CDF acts as a lookup table. The original pixel values of the tile are passed through this CDF to scale and map them to their new, equalized values.\r
\r
**3. Bilinear Interpolation**\r
If we just merged the tiles back together now, the image would look like a checkerboard because neighboring tiles used completely different CDF mappings. To fix this, the resulting tiles are stitched together using bilinear interpolation. This smooths out the contrast differences between regions, generating an output image with improved contrast and zero artificial boundaries.\r
\r
\`\`\`component\r
ClaheInterpolation\r
\`\`\`\r
\r
### Implementing CLAHE in Keras (PR #21953)\r
\r
Translating this algorithm from a theoretical mechanism into Keras 3 required relying strictly on \`keras.src.backend\` operations to ensure it worked perfectly across TensorFlow, JAX, and PyTorch. \r
\r
During the PR implementation, I ran into a few interesting engineering challenges:\r
\r
**Handling Odd Image Sizes (The Padding Logic)**\r
In theory, tiles perfectly divide an image. In practice, image dimensions are rarely perfectly divisible by the grid size. If you have a 500x500 image, how do you divide it cleanly into an 8x8 grid? \r
In Keras, I handled this by calculating the required mathematical padding (\`pad_h\`, \`pad_w\`). Before tile generation, the layer applies symmetric padding to the image edges so it divides perfectly. After the algorithm finishes, we simply crop the padded areas back out.\r
\r
**The Tensor Trick for Local Histograms**\r
In standard Python, computing histograms is as easy as calling \`numpy.histogram()\`. In a tensor graph, computing batched, localized histograms dynamically is trickier. \r
\r
To solve this efficiently for GPUs without using slow loops, the layer leverages \`backend.nn.one_hot\`. After reshaping the image into flat tiles and casting the pixels to integers, we apply a one-hot encoding over the 256 possible pixel values. By summing over the pixel axis, we instantly get the exact bin counts for every tile in the entire batch simultaneously:\r
\r
\`\`\`python\r
# Flattened tiles shape: (batch, grid_h, grid_w, channels, tile_pixels)\r
tiled_int = self.backend.cast(tiled_flat, "int32")\r
tiled_int = self.backend.numpy.clip(tiled_int, 0, 255)\r
\r
# Compute histograms via one_hot and sum simultaneously across the batch\r
hists = self.backend.numpy.sum(\r
    self.backend.nn.one_hot(tiled_int, 256), axis=-2\r
)\r
\`\`\`\r
*(Note: Because \`one_hot\` expands the tensor by a factor of 256, this operation can be memory-intensive for very high-resolution images or massive batch sizes).*\r
\r
**Vectorized Bilinear Interpolation**\r
Rather than writing complex nested loops for the stitching phase, the code computes a continuous grid of coordinates \`(y_grid, x_grid)\`, calculates the fractional distances to the nearest tile centers, and uses flat tensor indexing (\`backend.numpy.take\`) to pull the four neighbor values simultaneously. This keeps the interpolation phase highly parallelized.\r
\r
### Usage and Results\r
\r
Using the new layer is straightforward. It accepts a \`data_format\` argument (\`"channels_last"\` or \`"channels_first"\`), making it easy to drop into an existing \`keras.Sequential\` pipeline.\r
\r
\`\`\`python\r
import os\r
import keras\r
import cv2\r
import numpy as np\r
import requests\r
\r
os.environ["KERAS_BACKEND"] = "tensorflow" # Works with JAX and PyTorch natively!\r
\r
# 1. Download a low-contrast image\r
url = "https://upload.wikimedia.org/wikipedia/commons/a/a1/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg"\r
response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})\r
img_array = np.asarray(bytearray(response.content), dtype="uint8")\r
img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)\r
img = cv2.resize(img, (512, 512))\r
\r
# 2. Standard HE for comparison\r
img_standard_he = cv2.equalizeHist(img)\r
\r
# 3. Keras CLAHE\r
clahe_layer = keras.layers.ContrastLimitedAdaptiveHistogramEqualization(\r
    value_range=(0, 255), \r
    clip_limit=3.0, \r
    tile_grid_size=(8, 8), \r
    data_format="channels_last"\r
)\r
\r
img_tensor = np.expand_dims(img, axis=(0, -1)).astype(np.float32)\r
img_keras_clahe = np.squeeze(np.array(clahe_layer(img_tensor))).astype(np.uint8)\r
\`\`\`\r
\r
Running this on a standard X-Ray highlights the difference clearly:\r
\r
![CLAHE Comparison](/images/keras-clahe/comparison_chest_xray.png "Original vs Global HE vs CLAHE")\r
\r
Looking at the histograms:\r
*   **Original:** The pixel intensities are bunched up, resulting in a dark, low-contrast image.\r
*   **Global HE:** The intensities are forced aggressively across the entire spectrum. The uniform dark background gets stretched out unnecessarily, resulting in heavy noise and washed-out lung details.\r
*   **Keras CLAHE:** The histogram is balanced but strictly controlled. The noise in the homogeneous regions is suppressed, while the actual bone structures are sharpened perfectly for feature extraction.\r
\r
### Summary\r
\r
Ultimately, the goal of this PR was to make handling low-contrast images as frictionless as possible. By adding CLAHE as a native Keras layer, the entire preprocessing step becomes part of your computational graph. The math runs entirely on tensors, works seamlessly across TensorFlow, JAX, and PyTorch, and gets baked directly into your exported model.\r
\r
You can view the full source code and tests for the layer in [Keras PR #21953](https://github.com/keras-team/keras/pull/21953).`;export{e as default};
