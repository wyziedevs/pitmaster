<script lang="ts">
  // a qr code, drawn right here from the text: the link (and the tv code in
  // it) never goes anywhere to be turned into a picture
  import { encode } from "uqr";

  let { text, label, size = "112px" }: { text: string; label: string; size?: string } = $props();

  const qr = $derived(encode(text, { ecc: "M", border: 2 }));
  // one path for every dark square
  const d = $derived(qr.data.flatMap((row, y) => row.map((on, x) => (on ? `M${x} ${y}h1v1h-1z` : ""))).join(""));
</script>

<!-- dark on light whatever the theme: some phone cameras can't read it the other way round -->
<svg class="block rounded-[3px]" viewBox="0 0 {qr.size} {qr.size}" style:width={size} style:height={size} role="img" aria-label={label} shape-rendering="crispEdges">
  <rect width={qr.size} height={qr.size} fill="#fff" />
  <path {d} fill="#000" />
</svg>
