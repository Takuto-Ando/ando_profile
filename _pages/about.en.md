---
permalink: /en/about/
title: "Research Themes"
lang: 'en'
classes: wide
translations:
  ja: /about/
---

{% include lang-switcher.html %}

## Research Keywords
### Computer Architecture
- Domain-Specific Architectures
- AI Accelerators
- Non-von Neumann Paradigms
- Hardware/Software Co-Design
- Energy-Efficient, High-Performance Computing

### Application Domains
- Large Language Models (LLMs)
- Generative AI
  - Image Generation
  - Speech Recognition
- Deep Learning
- Edge AI / Edge Computing
- Image Processing / Computer Vision

## Current Research

In recent years, the rapid advancement of large language models (LLMs) and generative AI has been reshaping society. GPUs currently shoulder this explosive computational demand, yet their incredible performance comes at the cost of immense power consumption—turning data-center energy usage into a global concern. GPUs are not architectures optimized for power efficiency; rather, they trade on brute-force design choices such as extravagant memory buses. It is difficult to see this architecture serving as a sustainable foundation for the continued evolution of AI.

Although many visions for future computing—such as quantum computing, photonic computing, and neuromorphic chips that emulate the brain—are being proposed, I believe the most realistic and impactful next step is a mainstream shift toward efficient non-von Neumann computers that structurally eliminate the von Neumann bottleneck.

My research focuses on making this vision a reality. By orchestrating next-generation hardware approaches such as near-memory and in-memory computing with software that draws out their full potential, I aim to achieve levels of efficiency unattainable through software optimization alone and to contribute to a sustainable technological foundation for AI.

### Implementing and Evaluating AI Applications on IMAX
I am currently involved in research on IMAX (In-Memory Accelerator eXtension), a CGRA-based hardware accelerator developed by the Computer Architecture Laboratory at NAIST. IMAX offers the following innovations:

IMAX features a linear array structure that alternates compute units and cache memory, fusing the flexibility of CGRAs with the efficiency of systolic arrays and rapid compilation. It adopts a non-von Neumann architecture inspired by near-memory computing. Although IMAX is inherently non-von Neumann, it can map von Neumann-style processing elements anywhere on the array, enabling high throughput while preserving energy efficiency.

Within the IMAX project, I work on implementing and evaluating LLMs and AI applications on the edge-oriented IMAX3 and the server-oriented IMAX4 while optimizing memory access patterns.

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/imax3andimax4.jpg" alt="image-center" style="display: block; margin: 0 auto; width: 700px;">

I aim to showcase the potential of IMAX and drive its further development by implementing and evaluating state-of-the-art AI models that represent the forefront of the field. During my master's program, I plan to actively publish papers and present at conferences to raise awareness of IMAX (four peer-reviewed international conferences accepted between April and October 2025).

* **Executing Large Language Models and Bottleneck Analysis** (SASIMI 2025, SOCC 2025 accepted):  
  I analyzed the performance characteristics of running LLMs on the edge-focused IMAX3 and identified host CPU capability and data-transfer paths as bottlenecks. Building on these insights, I designed and evaluated an IMAX4 prototype equipped with a high-performance server CPU and a high-bandwidth PCIe Gen5 interface, verifying that removing host-side bottlenecks enables IMAX to scale to large AI workloads in data-center environments.
* **Implementing and Optimizing Diverse Generative AI Applications** (MCSoC 2025, CANDAR 2025 accepted):  
  Beyond LLMs, I implemented AI applications with diverse computational profiles—including the Stable Diffusion image generation model and the Whisper speech-recognition model—on IMAX. In the Whisper implementation, I developed and evaluated new FP16 compute kernels tailored to IMAX’s architectural strengths, gaining insights into balancing performance and accuracy. These efforts demonstrate that IMAX is a versatile accelerator not limited to specific use cases.

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/imax4_proto.jpg" alt="image-center" style="display: block; margin: 0 auto; width: 700px;">

Prototype of IMAX4 composed of one VPK120 and four VPK180 boards (published with permission)

Through these projects, I program in C to optimize memory-access patterns and fully leverage IMAX’s hardware resources. Practically engaging in hardware-aware software development has taught me how deeply understanding the hardware enables us to unlock its performance.

## Projects at College of Technology

### Practical Deployment of Object Detection Algorithms
For my fifth-year graduation project at the National Institute of Technology (Kosen), I developed an object-detection algorithm to improve the efficiency of scallion trimming. Specifically, I designed an application that detects branching points on scallion leaves by extracting features with edge detection. When deep-learning models are unnecessary, classical image-processing techniques can deliver high frame rates with low power consumption.

However, detection in real environments demands more advanced algorithms due to complex backgrounds, lighting conditions, and the natural variation in scallion shapes. To address these challenges, I implemented and evaluated deep-learning object-detection and segmentation models such as YOLO and Mask R-CNN. I also pursued model compression for lightweight deployment and application-specific optimization.

<div style="
  position: relative;
  display:block;
  margin:0 auto;
  width: 100%;
  max-width:780px;
  max-height: 585px;
  padding-bottom: 75%;
  top: 50%;">
  <iframe 
    src="https://speakerdeck.com/player/f027bc23215946868b187e68bec91c37" title="Instance Segmentation for Efficient Scallion Processing" 
    style="
      position: absolute;
      top: 0;
      left: 0%;
      width: 100%;
      height: 100%;
      max-width:780px;
      max-height: 585px;
      border: 0;
    ">
  </iframe>
</div>

### Hardware Implementation of AI Inference
In resource-constrained environments such as robots and IoT devices, achieving low-power AI inference is crucial. I focused on FPGAs—reconfigurable devices—and the DNN accelerators (DPUs) implemented on them. I constructed a system that time-multiplexes two distinct DNN models, facial detection and facial expression recognition, on a single DPU. This approach lets multiple tasks share hardware resources efficiently, delivering frame rates and power efficiency unattainable for embedded CPUs and demonstrating the effectiveness of hardware implementation for edge AI.

<img src="{{ site.url }}{{ site.baseurl }}/assets/images/fpga_system_fig.png" alt="image-center" style="display: block; margin: 0 auto; width: 500px;">

<div style="
  position: relative;
  display:block;
  margin:0 auto;
  width: 100%;
  max-width:780px;
  max-height: 585px;
  padding-bottom: 75%;
  top: 50%;">
  <iframe 
    src="https://speakerdeck.com/player/31712b81ffbe4805832711d6c3b4f209" title="FPGA Implementation of a Multi-Task DNN Facial Expression Recognition System" 
    style="
      position: absolute;
      top: 0;
      left: 0%;
      width: 100%;
      height: 100%;
      max-width:780px;
      max-height: 585px;
      border: 0;
    ">
  </iframe>
</div>

<br>

