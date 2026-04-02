---
permalink: /publications/
classes: wide
---

{% include lang-switcher.html %}

<style>
.page__content table tr.pub-clickable {
  cursor: pointer;
}

.page__content table tr.pub-clickable:focus {
  outline: 2px solid var(--acc);
  outline-offset: -2px;
}

.page__content table a.pub-row-target {
  display: none;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.page__content table tr').forEach(function (row) {
    var target = row.querySelector('a.pub-row-target') || row.querySelector('a');
    if (!target || !target.href) return;

    row.classList.add('pub-clickable');
    row.tabIndex = 0;
    row.setAttribute('role', 'link');
    row.setAttribute('aria-label', 'Open publication link');

    row.addEventListener('click', function (event) {
      if (event.target.closest('a')) return;
      window.location.href = target.href;
    });

    row.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = target.href;
      }
    });
  });
});
</script>

{% if site.active_lang == 'en' %}

## Publications

### International Journals (Peer-reviewed)

| Publications | 
|---|---|
| **Takuto Ando**, Iori Yamaguchi, Jun Shono, Takahiro Kawabe, Koji Uchida, Kosuke Shigematsu, Yusuke Inoue, "Lightweight YOLOX-based Green Onion Branching Point Detection for Automated Peeling on Edge Device," *ICIC Express Letters*, 2026. (accepted) |
| **Takuto Ando**, Yu Eto, Ayumu Takeuchi, Yasuhiko Nakashima, "Efficient Kernel Mapping and Comprehensive System Evaluation of LLM Acceleration on a CGLA," *IEEE Access*, vol. 13, pp. 199631–199646, Nov 2025. DOI: [10.1109/ACCESS.2025.3636266](https://ieeexplore.ieee.org/document/11264489) |
| **Takuto Ando**, Yusuke Inoue, "DPU-Based Hardware Implementation for Real-time Facial Expression Recognition System," *ICIC Express Letters 19(4)*, pp. 419–426, April 2025. DOI: [10.24507/icicel.19.04.419](http://www.icicel.org/ell/contents/2025/4/el-19-04-07.pdf)<a class="pub-row-target" href="{{ '/assets/pdfs/paper/icic_express.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |

---

### Domestic Journals (Peer-reviewed)

| Publications |
|---|---|
| **安藤 拓翔**, 井上 優良, "エッジデバイス上におけるリアルタイム小ねぎ分岐部位置検出," *農業情報研究*, vol. 33, no. 2, pp. 73–80, July 2024. DOI: [10.3173/air.33.73](https://doi.org/10.3173/air.33.73) |

---

### International Conferences

| Publications |
|---|---|
| **Takuto Ando**, Ayumu Takeuchi, Yu Eto, Yoshifumi Munakata, Yasuhiko Nakashima, "Q-snap: Quantization-aware dynamic chunking for LLM execution on a CGLA," *ICISN 2026*, Mar 2026. <span style="color:#059669;font-weight:600">[Best Paper Award]</span> |
| **Takuto Ando**, Yu Eto, Yasuhiko Nakashima, "Implementation and Evaluation of Stable Diffusion on a General-Purpose CGLA Accelerator," *MCSoC 2025*, Dec 2025. [arXiv:2511.02530](https://arxiv.org/abs/2511.02530)<a class="pub-row-target" href="{{ '/assets/pdfs/paper/mcsoc2025.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| **Takuto Ando**, Yu Eto, Ayumu Takeuchi, Yasuhiko Nakashima, "Energy-Efficient Hardware Acceleration of Whisper ASR on a CGLA," *CANDAR 2025*, Nov 2025. [arXiv:2511.02269](https://arxiv.org/abs/2511.02269)<a class="pub-row-target" href="{{ '/assets/pdfs/paper/candar2025.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> <span style="color:#059669;font-weight:600">[Best Paper Award]</span> |
| **Takuto Ando**, Yu Eto, Ayumu Takeuchi, Yasuhiko Nakashima, "Energy-Efficient Llama3 Acceleration on a CGLA by Offloading Computational Kernels," *SOCC 2025 PhD/Master Forum*, Sep 2025.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/socc2025.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| Yu Eto, **Takuto Ando**, Ayumu Takeuchi, Yasuhiko Nakashima, "LLM Performance Bottlenecks on CGLA," *SOCC 2025 PhD/Master Forum*, Sep 2025. |
| Ayumu Takeuchi, Yu Eto, **Takuto Ando**, Yasuhiko Nakashima, "Energy-Efficient FlashAttention Acceleration on CGLA," *SOCC 2025 PhD/Master Forum*, Sep 2025. |
| Yu Eto, **Takuto Ando**, Yasuhiko Nakashima, "Performance Evaluation of Flan-T5 in CGLA Based Accelerators," *SOCC 2025 Special Session*, Oct 2025. |
| **Takuto Ando**, Yu Eto, Yasuhiko Nakashima, "A Detailed Analysis of LLM Execution on IMAX3 and Initial Evaluation of IMAX4 Prototype for Server Environment," *SASIMI 2025*, Oct 2025.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/sasimi2025.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> <span style="color:#059669;font-weight:600">[Young Researcher Award]</span> |
| **Takuto Ando**, Yusuke Inoue, "Facial Expression Recognition System Using DNN Accelerator with Multi-threading on FPGA," *CANDARW 2024*, pp. 103–109, Dec 2024. DOI: [10.1109/CANDARW64572.2024.00025](https://ieeexplore.ieee.org/document/10817888)<a class="pub-row-target" href="{{ '/assets/pdfs/paper/candar2024gca.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| **Takuto Ando**, Yusuke Inoue, "FPGA Implementation of a DPU-Based Facial Expression Recognition System," *SASIMI 2024*, Mar 2024.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/Facial_Expression_Recognition_System_Using_DNN_Accelerator_with_Multi-threading_on_FPGA.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |

---

### Domestic Conferences

| Publications |
|---|---|
| **安藤 拓翔**, 井上 優良, "DNNアクセラレータを用いた表情認識システムにおける電力効率の向上," *情処全国大会 第87回*, 2025.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/ipsj87_takuto_ando.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> <span style="color:#059669;font-weight:600">[学生奨励賞]</span> |
| **安藤 拓翔**, 井上 優良, "小ねぎ調製位置検出のためのインスタンスセグメンテーション," *電子情報通信学会九州支部学生会講演会*, 2024.<a class="pub-row-target" href="{{ '/assets/pdfs/ieice_kyusyu_ando.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| **安藤 拓翔**, 井上 優良, "FPGAにおけるDPUを用いた表情認識システムの実装," *情処ARC研究発表会*, 2024.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/ipsj_arc2024.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| **安藤 拓翔**, 井上 優良, "FPGAによるリアルタイム表情認識システムの実装," *電子情報通信学会九州支部学生会講演会*, 2023. |
| **安藤 拓翔**, 井上 優良, "エッジ検出を用いたこねぎ分岐部の検出," *情処ARC研究発表会*, 2023. |

{% else %}

## 研究業績

### 国際論文誌（査読付き）

| Publications |
|---|---|
| **Takuto Ando**, Iori Yamaguchi, Jun Shono, Takahiro Kawabe, Koji Uchida, Kosuke Shigematsu, Yusuke Inoue, "Lightweight YOLOX-based Green Onion Branching Point Detection for Automated Peeling on Edge Device," *ICIC Express Letters*, 2026. (accepted) |
| **Takuto Ando**, Yu Eto, Ayumu Takeuchi, Yasuhiko Nakashima, "Efficient Kernel Mapping and Comprehensive System Evaluation of LLM Acceleration on a CGLA," *IEEE Access*, vol. 13, pp. 199631–199646, Nov 2025. DOI: [10.1109/ACCESS.2025.3636266](https://ieeexplore.ieee.org/document/11264489) |
| **Takuto Ando**, Yusuke Inoue, "DPU-Based Hardware Implementation for Real-time Facial Expression Recognition System," *ICIC Express Letters 19(4)*, pp. 419–426, April 2025. DOI: [10.24507/icicel.19.04.419](http://www.icicel.org/ell/contents/2025/4/el-19-04-07.pdf)<a class="pub-row-target" href="{{ '/assets/pdfs/paper/icic_express.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |

---

### 国内論文誌（査読付き）

| Publications |
|---|---|
| **安藤 拓翔**, 井上 優良, "エッジデバイス上におけるリアルタイム小ねぎ分岐部位置検出," *農業情報研究*, vol. 33, no. 2, pp. 73–80, July 2024. DOI: [10.3173/air.33.73](https://doi.org/10.3173/air.33.73) |

---

### 国際会議

| Publications |
|---|---|
| **Takuto Ando**, Ayumu Takeuchi, Yu Eto, Yoshifumi Munakata, Yasuhiko Nakashima, "Q-snap: Quantization-aware dynamic chunking for LLM execution on a CGLA," *ICISN 2026*, Mar 2026. <span style="color:#059669;font-weight:600">[Best Paper Award]</span> |
| **Takuto Ando**, Yu Eto, Yasuhiko Nakashima, "Implementation and Evaluation of Stable Diffusion on a General-Purpose CGLA Accelerator," *MCSoC 2025*, Dec 2025. [arXiv:2511.02530](https://arxiv.org/abs/2511.02530)<a class="pub-row-target" href="{{ '/assets/pdfs/paper/mcsoc2025.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| **Takuto Ando**, Yu Eto, Ayumu Takeuchi, Yasuhiko Nakashima, "Energy-Efficient Hardware Acceleration of Whisper ASR on a CGLA," *CANDAR 2025*, Nov 2025. [arXiv:2511.02269](https://arxiv.org/abs/2511.02269)<a class="pub-row-target" href="{{ '/assets/pdfs/paper/candar2025.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> <span style="color:#059669;font-weight:600">[Best Paper Award]</span> |
| **Takuto Ando**, Yu Eto, Ayumu Takeuchi, Yasuhiko Nakashima, "Energy-Efficient Llama3 Acceleration on a CGLA by Offloading Computational Kernels," *SOCC 2025 PhD/Master Forum*, Sep 2025.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/socc2025.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| Yu Eto, **Takuto Ando**, Ayumu Takeuchi, Yasuhiko Nakashima, "LLM Performance Bottlenecks on CGLA," *SOCC 2025 PhD/Master Forum*, Sep 2025. |
| Ayumu Takeuchi, Yu Eto, **Takuto Ando**, Yasuhiko Nakashima, "Energy-Efficient FlashAttention Acceleration on CGLA," *SOCC 2025 PhD/Master Forum*, Sep 2025. |
| Yu Eto, **Takuto Ando**, Yasuhiko Nakashima, "Performance Evaluation of Flan-T5 in CGLA Based Accelerators," *SOCC 2025 Special Session*, Oct 2025. |
| **Takuto Ando**, Yu Eto, Yasuhiko Nakashima, "A Detailed Analysis of LLM Execution on IMAX3 and Initial Evaluation of IMAX4 Prototype for Server Environment," *SASIMI 2025*, Oct 2025.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/sasimi2025.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> <span style="color:#059669;font-weight:600">[Young Researcher Award]</span> |
| **Takuto Ando**, Yusuke Inoue, "Facial Expression Recognition System Using DNN Accelerator with Multi-threading on FPGA," *CANDARW 2024*, pp. 103–109, Dec 2024. DOI: [10.1109/CANDARW64572.2024.00025](https://ieeexplore.ieee.org/document/10817888)<a class="pub-row-target" href="{{ '/assets/pdfs/paper/candar2024gca.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| **Takuto Ando**, Yusuke Inoue, "FPGA Implementation of a DPU-Based Facial Expression Recognition System," *SASIMI 2024*, Mar 2024.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/Facial_Expression_Recognition_System_Using_DNN_Accelerator_with_Multi-threading_on_FPGA.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |

---

### 国内研究会

| Publications |
|---|---|
| **安藤 拓翔**, 井上 優良, "DNNアクセラレータを用いた表情認識システムにおける電力効率の向上," *情処全国大会 第87回*, 2025.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/ipsj87_takuto_ando.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> <span style="color:#059669;font-weight:600">[学生奨励賞]</span> |
| **安藤 拓翔**, 井上 優良, "小ねぎ調製位置検出のためのインスタンスセグメンテーション," *電子情報通信学会九州支部学生会講演会*, 2024.<a class="pub-row-target" href="{{ '/assets/pdfs/ieice_kyusyu_ando.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| **安藤 拓翔**, 井上 優良, "FPGAにおけるDPUを用いた表情認識システムの実装," *情処ARC研究発表会*, 2024.<a class="pub-row-target" href="{{ '/assets/pdfs/paper/ipsj_arc2024.pdf' | relative_url }}" aria-hidden="true" tabindex="-1">Open</a> |
| **安藤 拓翔**, 井上 優良, "FPGAによるリアルタイム表情認識システムの実装," *電子情報通信学会九州支部学生会講演会*, 2023. |
| **安藤 拓翔**, 井上 優良, "エッジ検出を用いたこねぎ分岐部の検出," *情処ARC研究発表会*, 2023. |

{% endif %}
