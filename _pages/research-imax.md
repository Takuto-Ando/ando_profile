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

| | IMAX3 | IMAX4 |
|--|-------|-------|
| **Target** | Edge devices | Server / data center |
| **Host CPU** | Low-power embedded | High-performance server CPU |
| **Interconnect** | PCIe Gen3/4 | PCIe Gen5 |
| **Use case** | On-device AI inference | Large-scale LLM / generative AI |

**IMAX3** is optimized for deployment on edge devices with tight power budgets. My research revealed its host-side bottlenecks when running LLMs, which informed the design of IMAX4.

**IMAX4** is a server-oriented prototype incorporating a high-performance CPU and wide PCIe Gen5 bandwidth. It was co-designed with the bottleneck analysis results and demonstrates server-scale AI workload capacity.

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

| | IMAX3 | IMAX4 |
|--|-------|-------|
| **対象** | エッジデバイス | サーバ / データセンター |
| **ホスト CPU** | 低消費電力組み込み | 高性能サーバ CPU |
| **インターコネクト** | PCIe Gen3/4 | PCIe Gen5 |
| **用途** | デバイス上での AI 推論 | 大規模 LLM / 生成 AI |

**IMAX3** は電力予算が厳しいエッジデバイスへの展開に最適化されています。私の研究でLLM実行時のホスト側ボトルネックを特定し、IMAX4 の設計指針となりました。

**IMAX4** は高性能 CPU と広帯域 PCIe Gen5 を搭載したサーバ指向プロトタイプです。ボトルネック分析の結果を踏まえて共同設計され、サーバ規模のAIワークロード処理能力を実証しています。

<div markdown="0" style="margin:1.5rem 0;">
  <img src="{{ '/assets/images/imax4_proto.jpg' | relative_url }}" alt="IMAX4 プロトタイプ" style="max-width:560px;width:100%;border:1px solid #E2E8F0;">
</div>

{% endif %}
