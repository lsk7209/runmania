/**
 * @file healthTopic.ts
 * 통증·부상 등 건강(YMYL 인접) 주제 글 판별.
 * 해당 글은 상세 화면에서 진료 권고·공식 출처·감수 상태 안내를 노출한다.
 */
const HEALTH_TOPIC =
  /(무릎|족저근막|통증|부상|발목|정강이|관절|아킬레스|염증|재활|티눈|무지외반|허리|신스플린트|물집|저림|임신)/;

export function isHealthTopic(title: unknown): boolean {
  return typeof title === "string" && HEALTH_TOPIC.test(title);
}
