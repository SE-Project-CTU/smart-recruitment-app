namespace SmartHire.Domain.ValueObjects;

public sealed record JobMatchingWeights(
    decimal SkillWeight = 0.40m,
    decimal ExperienceWeight = 0.25m,
    decimal TitleWeight = 0.25m,
    decimal OtherWeight = 0.10m
) {
    public static JobMatchingWeights Default => new(0.40m, 0.25m, 0.25m, 0.10m);

    public static JobMatchingWeights FromValues(
        decimal? skill,
        decimal? experience,
        decimal? title,
        decimal? other) {
        decimal s = skill ?? 0.40m;
        decimal e = experience ?? 0.25m;
        decimal t = title ?? 0.25m;
        decimal o = other ?? 0.10m;

        // Nếu client truyền dạng % (ví dụ: 40, 25, 25, 10), chuẩn hóa về hệ thập phân 0.0 -> 1.0
        if (s > 1.0m || e > 1.0m || t > 1.0m || o > 1.0m) {
            s /= 100m;
            e /= 100m;
            t /= 100m;
            o /= 100m;
        }

        var weights = new JobMatchingWeights(s, e, t, o);
        return weights.IsValid() ? weights : Default;
    }

    public bool IsValid() {
        if (SkillWeight < 0 || ExperienceWeight < 0 || TitleWeight < 0 || OtherWeight < 0) return false;
        var sum = SkillWeight + ExperienceWeight + TitleWeight + OtherWeight;
        return Math.Abs(sum - 1.0m) <= 0.015m;
    }
}
