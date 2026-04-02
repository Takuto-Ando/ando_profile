---
permalink: /research/imax/
classes: wide
---

{% include lang-switcher.html %}

{% if site.active_lang == 'en' %}

## IMAX Architecture

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">CGRA / CGLA</span>
  <span class="bp-tag">Near-Memory Computing</span>
  <span class="bp-tag">Edge &amp; Server</span>
</div>

### What is IMAX?

**IMAX** (In-Memory Accelerator eXtension) is a non-von Neumann **CGLA** (Coarse-Grained Logic Array) developed at NAIST's Computing Architecture Laboratory. It is designed to structurally eliminate the von Neumann bottleneck — the fundamental performance wall caused by repeatedly moving data between processing units and main memory.

### Architecture Design

IMAX's core innovation is its **interleaved linear array** structure: compute units (PEs) and cache memory banks are alternately placed in a single physical dimension. This means data processed by one PE is directly available to the adjacent memory bank, drastically reducing memory access latency.

Key properties:
- **CGRA flexibility**: Reconfigurable dataflow mapping without circuit modification
- **Systolic-array efficiency**: High-throughput pipelined execution
- **Near-memory computing**: Compute placed physically adjacent to storage
- **Non-von Neumann PE support**: Von Neumann PEs can be optionally instantiated on the array for control-flow tasks

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX concept" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 and IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### IMAX3 vs IMAX4

### Specifications

| | IMAX3 | IMAX4 |
|--|-------|-------|
| **Target** | Edge devices | Server / data center |
| **Host CPU** | Dual-core ARM Cortex-A72 | Intel Xeon (16-core) |
| **FPGA** | AMD Versal VPK180 | VPK120 (bridge) + 4x VPK180 |
| **Clock** | 145 MHz | 145 MHz (FPGA) |
| **Interconnect** | LPDDR4 (32-bit, 4 Gbps/lane) | PCIe Gen5 (2 links) |
| **LMM per PE** | 32–512 KB (configurable) | 32–512 KB (configurable) |
| **DMA Buffer** | Limited | 16 GB (CMA) |
| **ASIC Projection** | 840 MHz @ 28nm | — |
| **Use case** | On-device AI inference | Large-scale LLM / generative AI |

**IMAX3** is optimized for edge devices with tight power budgets. My research running LLMs on IMAX3 revealed that the primary bottleneck is not the CGLA compute, but the host CPU's token generation and PCIe data transfer latency. For example, with Q8_0 quantization, the ARM CPU consumed **1,462 seconds** of the total 1,799-second latency — over 80% of execution time.

**IMAX4** was designed to resolve these host-side bottlenecks. By upgrading to an Intel Xeon processor and PCIe Gen5 interconnect, CPU overhead dropped from 1,462s to **15.3s** — a **95x improvement**. Weight transfer (CPYIN) improved from 350.9s to **3.0s** (117x). This validated that IMAX scales to server-level workloads when paired with adequate host infrastructure.

<div markdown="0" style="margin:1.5rem 0;">
  <img src="{{ '/assets/images/imax4_proto.jpg' | relative_url }}" alt="IMAX4 Prototype" style="max-width:560px;width:100%;border:1px solid #E2E8F0;">
</div>

{% else %}

## IMAX アーキテクチャ

<div class="bp-tags" markdown="0" style="margin-bottom:1.25rem;">
  <span class="bp-tag">CGRA / CGLA</span>
  <span class="bp-tag">ニアメモリコンピューティング</span>
  <span class="bp-tag">エッジ &amp; サーバ</span>
</div>

### IMAX とは

**IMAX**（In-Memory Accelerator eXtension）は、奈良先端科学技術大学院大学 コンピューティング・アーキテクチャ研究室が開発した非ノイマン型 **CGLA**（粗粒度再構成可能論理アレイ）です。演算ユニットとメインメモリ間のデータ転送が引き起こす根本的な性能の壁、「フォン・ノイマン・ボトルネック」を構造的に排除するために設計されています。

### アーキテクチャ設計

IMAX の核心的な革新は**交互配置線形アレイ**構造にあります。演算ユニット（PE）とキャッシュメモリバンクが1次元上に交互に配置され、あるPEで処理されたデータが隣接するメモリバンクに直接アクセスできます。これによりメモリアクセスレイテンシを大幅に削減します。

主な特性：
- **CGRAの柔軟性**：回路変更なしに再構成可能なデータフローマッピング
- **シストリックアレイの効率性**：高スループットのパイプライン実行
- **ニアメモリコンピューティング**：演算ユニットをストレージの物理的近傍に配置
- **ノイマン型PE対応**：制御フロータスク用のノイマン型PE をアレイ上に任意配置可能

<div markdown="0" style="display:flex;flex-wrap:wrap;gap:1.5rem;margin:1.5rem 0;">
  <img src="{{ '/assets/images/imax.jpg' | relative_url }}" alt="IMAX コンセプト" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
  <img src="{{ '/assets/images/imax3andimax4.jpg' | relative_url }}" alt="IMAX3 と IMAX4" style="width:48%;min-width:220px;border:1px solid #E2E8F0;">
</div>

### IMAX3 と IMAX4

### 仕様

| | IMAX3 | IMAX4 |
|--|-------|-------|
| **対象** | エッジデバイス | サーバ / データセンター |
| **ホスト CPU** | デュアルコア ARM Cortex-A72 | Intel Xeon（16コア） |
| **FPGA** | AMD Versal VPK180 | VPK120（ブリッジ）+ 4x VPK180 |
| **クロック** | 145 MHz | 145 MHz（FPGA） |
| **インターコネクト** | LPDDR4（32ビット、4 Gbps/レーン） | PCIe Gen5（2リンク） |
| **PE あたり LMM** | 32〜512 KB（構成可能） | 32〜512 KB（構成可能） |
| **DMA バッファ** | 限定的 | 16 GB（CMA） |
| **ASIC 見積** | 840 MHz @ 28nm | — |
| **用途** | デバイス上での AI 推論 | 大規模 LLM / 生成 AI |

**IMAX3** は電力予算が厳しいエッジデバイスへの展開に最適化されています。IMAX3 上での LLM 実行研究により、主なボトルネックが CGLA 演算ではなく、ホスト CPU のトークン生成と PCIe データ転送レイテンシにあることを特定しました。例えば Q8_0 量子化では、ARM CPU が全体1,799秒のうち **1,462秒** を消費 — 実行時間の80%以上を占めていました。

**IMAX4** はこのホスト側ボトルネックを解消するために設計されました。Intel Xeon プロセッサと PCIe Gen5 インターコネクトへのアップグレードにより、CPU オーバーヘッドが 1,462秒 から **15.3秒** に低減 — **95倍の改善**。重みデータ転送（CPYIN）も 350.9秒 から **3.0秒** に改善（117倍）。適切なホストインフラとの組み合わせにより、IMAX がサーバレベルのワークロードにスケールすることを実証しました。

<div markdown="0" style="margin:1.5rem 0;">
  <img src="{{ '/assets/images/imax4_proto.jpg' | relative_url }}" alt="IMAX4 プロトタイプ" style="max-width:560px;width:100%;border:1px solid #E2E8F0;">
</div>

{% endif %}
