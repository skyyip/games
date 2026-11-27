## Analysis scope and limitations

- Source commit: `7d68e556495ab7d439bf886fea2dc681a45a95cc`; Graphify 0.9.120; default undirected graph.
- Structural extraction processed 109 code files. Ten scripts or thin entry points yielded no modeled symbols; structural extraction does not execute the game.
- Semantic extraction fully covered 15 documents and visually reviewed all 313 images. Coverage validation passed for all 328 files and all 317 chunks.
- Image nodes describe visible content. No code-to-image relationships were invented; isolated image nodes are expected in this graph.
- The six WAV files were not transcribed because the optional faster-whisper dependency is absent. `assets/ASSETS.md:47` identifies them as original synthesized four-second scene effects; no speech transcript was fabricated.
- Ten detected-but-unclassified files are outside the graph: six CSS files, one Firestore rules file, one web manifest, and two files without a suffix. Firebase concepts from documents do not substitute for analysis of `firestore.rules`.
- Raw extraction diagnostics found 42 dangling-endpoint relationships, 3 self-loops, and 59 relationships sharing endpoint pairs that collapse in the default undirected graph. There are no missing endpoint fields. These findings limit static relationship completeness; see `GRAPH_HEALTH.txt` and `GRAPH_HEALTH.json`.
- Host-agent input/output token usage is not exposed by the collaboration tool. `cost.json` retains compatible numeric placeholders and explicitly records this measurement limitation.
- Shareable graph artifacts are prepared for version control. The local `.gitignore` excludes extraction caches, temporary files, and host-specific interpreter/root paths. Game source files were not changed.

- Offline visualization: `graph.html` embeds the official npm `vis-network@9.1.6` distribution. Its SHA-384 exactly matches the original CDN integrity value; the MIT license is included. No CDN connection is needed for this artifact.
