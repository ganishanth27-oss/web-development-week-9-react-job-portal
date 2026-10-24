/**
 * Skill-based transparent job matching algorithm.
 * Evaluates candidate profile skills and experience against job required skills.
 * Produces an exact percentage match, matched skills list, missing skills list,
 * and transparent explanation for the score.
 */

export function calculateSkillMatch(candidate = {}, job = {}) {
  // Normalize candidate skills
  const candidateSkills = Array.isArray(candidate.skills)
    ? candidate.skills.map((s) => String(s).trim().toLowerCase())
    : typeof candidate.skills === "string"
    ? candidate.skills.split(",").map((s) => s.trim().toLowerCase())
    : [];

  // Normalize job skills
  const jobSkills = Array.isArray(job.skills)
    ? job.skills.map((s) => String(s).trim().toLowerCase())
    : typeof job.skills === "string"
    ? job.skills.split(",").map((s) => s.trim().toLowerCase())
    : [];

  if (candidateSkills.length === 0) {
    return {
      score: 50,
      matchedSkills: [],
      missingSkills: jobSkills,
      hasCandidateSkills: false,
      reason: "Add skills to your profile to get a personalized match score.",
    };
  }

  if (jobSkills.length === 0) {
    return {
      score: 80,
      matchedSkills: [],
      missingSkills: [],
      hasCandidateSkills: true,
      reason: "General opportunity matching your candidate profile.",
    };
  }

  const matched = [];
  const missing = [];

  jobSkills.forEach((skill) => {
    const isDirectMatch = candidateSkills.some(
      (cSkill) =>
        cSkill === skill ||
        cSkill.includes(skill) ||
        skill.includes(cSkill)
    );

    if (isDirectMatch) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const skillMatchRatio = matched.length / jobSkills.length;
  // Calculate percentage between 35% and 98%
  let score = Math.round(35 + skillMatchRatio * 63);

  let reason = "";
  if (skillMatchRatio === 1) {
    reason = `Exceptional match! You match all ${matched.length} required skills.`;
  } else if (skillMatchRatio >= 0.6) {
    reason = `Strong match: ${matched.length} of ${jobSkills.length} required skills verified (${matched.slice(0, 3).join(", ")}).`;
  } else if (skillMatchRatio > 0) {
    reason = `Partial match: Matches ${matched.join(", ")}. Consider learning ${missing.slice(0, 2).join(", ")}.`;
  } else {
    reason = `Low skill overlap. Requires ${missing.slice(0, 3).join(", ")}.`;
  }

  return {
    score,
    matchedSkills: matched,
    missingSkills: missing,
    hasCandidateSkills: true,
    reason,
  };
}

export default calculateSkillMatch;
