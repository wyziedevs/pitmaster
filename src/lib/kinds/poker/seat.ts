// where someone sits, in words, for Find Me on a phone
import type { Game, Player } from "$lib/types";
import { tableCounts } from "$lib/game";
import { t } from "$lib/i18n";

export function seatText(game: Game, p: Player) {
  if (!p.seat) return "";
  return tableCounts(game).length > 1 ? t("tv.find.tableSeat", { table: String(p.seat.table), seat: String(p.seat.seat) }) : t("tv.find.seat", { seat: String(p.seat.seat) });
}
