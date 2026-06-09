---
title: "Tearing Down SD3"
description: "My Journey Building the Stable Diffusion 3 Modular Pipeline"
date: "2026-04-27"
series: "patch-notes"
order: 1
readingTime: 10
---

# Tearing Down SD3: My Journey Building the Stable Diffusion 3 Modular Pipeline

Stable Diffusion 3 is an absolute powerhouse of a model. It uses a Multimodal Diffusion Transformer (MMDiT), Flow Matching, and not one, not two, but *three* separate text encoders (two CLIPs and a T5). 

But that power comes at a steep cost: memory. For most developers running consumer hardware, loading the entire SD3 monolithic pipeline into VRAM is a fast track to an Out-Of-Memory (OOM) error. 

Recently, the Diffusers team introduced **Modular Diffusers**—a new architecture that breaks traditional, rigid pipelines into composable, Lego-like blocks. I realized this was exactly what SD3 needed. If we could break SD3 into independent blocks, users could dynamically drop massive components (like the T5 encoder), inject custom logic, and seamlessly manage memory.

I recently authored PR [#13324](https://github.com/huggingface/diffusers/pull/13324), which officially introduces the `StableDiffusion3ModularPipeline`. Here is a look under the hood at the engineering challenges of breaking down a monolith, the math behind FlowMatch dynamic shifting, and how you can use this to run SD3 without melting your GPU.
