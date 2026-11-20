/** Where Back goes when there is no earlier page on this site (a page opened from a shared link). */
export function parentOf(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return "/";
  // Pages deeper than a section go to that section: /quizzes/abc/result/x -> /quizzes, /admin/questions/new -> /admin/questions
  if (parts[0] === "exams") return "/";
  if (parts[0] === "admin") return parts.length === 2 ? "/admin/dashboard" : `/admin/${parts[1]}`;
  return `/${parts[0]}`;
}
