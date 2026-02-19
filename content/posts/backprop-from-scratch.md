---
title: "Backpropagation From Scratch"
description: "Deriving and implementing backprop in pure NumPy. We build a tiny autograd engine step by step."
date: "2024-02-15"
series: "build-it"
order: 1
readingTime: 22
---

## What We're Building

[Placeholder — describe the tiny autograd engine.]

---

## The Chain Rule

For a composed function $L = f(g(x))$:

$$
\frac{\partial L}{\partial x} = \frac{\partial L}{\partial f} \cdot \frac{\partial f}{\partial g} \cdot \frac{\partial g}{\partial x}
$$

---

## Interactive: Gradient Descent

Watch gradient descent minimize $L(w) = (w-2)^2 + 1$:

```component
GradientSlider
```

[Placeholder — connect this to the backprop derivation.]

---

## Implementation

```python
import numpy as np

class Value:
    """A scalar value with automatic gradient tracking."""

    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad  += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad  += other.data * out.grad
            other.grad += self.data  * out.grad
        out._backward = _backward
        return out

    def relu(self):
        out = Value(max(0, self.data), (self,), 'ReLU')

        def _backward():
            self.grad += (out.data > 0) * out.grad
        out._backward = _backward
        return out

    def backward(self):
        # Topological sort then reverse-mode accumulation
        topo, visited = [], set()
        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)
        build(self)

        self.grad = 1.0
        for v in reversed(topo):
            v._backward()
```

---

## Worked Example

[Placeholder — trace through a 2-layer network by hand.]

---

## What's Next

[Placeholder — point to PyTorch autograd internals.]
