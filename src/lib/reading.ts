/**
 * Reading-cycle presentation helpers.
 *
 * A cycle is opened long before its closing meeting and stays open afterwards,
 * until the club picks the next book. The page therefore has to describe two
 * different states with one block: "you are reading" and "the meeting happened".
 */
export type CycleTiming = {
  /** Closing meeting is in the past: show it as a record, not as an invitation. */
  closed: boolean;
  /** Whole days until the closing meeting; negative once it has passed. */
  daysTo: number | null;
  /** Short, honest heading for the block. */
  heading: string;
  /** One line of context under the heading. */
  note: string;
};

export function cycleTiming(
  cycle: { meetingAt?: Date | null; endsAt?: Date | null },
  now: Date = new Date(),
): CycleTiming {
  const closing = cycle.meetingAt ?? cycle.endsAt ?? null;
  if (!closing) {
    return { closed: false, daysTo: null, heading: "Joriy o‘qish", note: "Uchrashuv sanasi tez orada e’lon qilinadi" };
  }

  const ms = closing.getTime() - now.getTime();
  const daysTo = Math.ceil(ms / 86_400_000);

  if (ms < 0) {
    return {
      closed: true,
      daysTo,
      heading: "Yakunlangan o‘qish",
      note: "Taqdimot bo‘lib o‘tdi — keyingi kitob e’lon qilinmoqda",
    };
  }
  if (daysTo === 0) {
    return { closed: false, daysTo, heading: "Joriy o‘qish", note: "Yakuniy uchrashuv bugun" };
  }
  if (daysTo === 1) {
    return { closed: false, daysTo, heading: "Joriy o‘qish", note: "Yakuniy uchrashuv ertaga" };
  }
  return { closed: false, daysTo, heading: "Joriy o‘qish", note: `Yakuniy uchrashuvga ${daysTo} kun` };
}
