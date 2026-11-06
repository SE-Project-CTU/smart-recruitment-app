import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Minus,
  Share2,
  ThumbsUp,
  Bookmark,
  BookmarkCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/common";
import { toast } from "@/hooks/use-toast";
import { PATHS } from "@/constants/paths";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  POPULAR_TAGS,
  type BlogPost,
} from "@/constants/blogData";
import { EmptyStreet } from "@/assets/images/decoration";

// Data FAQ Accordion tương tác theo ảnh mẫu
const CAREER_FAQS = [
  {
    id: "faq-1",
    question: "Làm thế nào để CV vượt qua hệ thống quét tự động ATS?",
    answer:
      "Hệ thống theo dõi ứng viên (ATS) quét hồ sơ dựa trên các từ khóa khớp với Mô tả công việc (JD). Để tối ưu, hãy sử dụng định dạng một cột sạch sẽ, đặt tên tiêu đề chuẩn hóa (Học vấn, Kinh nghiệm, Kỹ năng), xuất file định dạng PDF chuẩn và lồng ghép khéo léo các từ khóa kỹ năng cốt lõi cùng các kết quả định lượng cụ thể theo số liệu thay vì mô tả chung chung.",
    imageUrl:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "faq-2",
    question: "Phương pháp trả lời phỏng vấn STAR là gì và áp dụng ra sao?",
    answer:
      "Mô hình STAR bao gồm 4 phần: Tình huống (Situation) - Nhiệm vụ (Task) - Hành động (Action) - Kết quả (Result). Khi gặp các câu hỏi hành vi như 'Hãy kể về một lần bạn giải quyết xung đột trong nhóm', bạn hãy phác thảo nhanh bối cảnh, vai trò của bạn, các bước hành động cụ thể đã làm và quan trọng nhất là con số kết quả tích cực đạt được sau hành động đó.",
    imageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "faq-3",
    question: "Bí quyết đàm phán mức lương kỳ vọng mà không mất thiện cảm?",
    answer:
      "Khảo sát trước dải lương trung bình của vị trí tương đương trên thị trường thông qua các báo cáo uy tín. Tránh đưa ra con số tuyệt đối ngay từ đầu; hãy đưa ra một dải lương linh hoạt (ví dụ: 25 - 32 triệu) và nhấn mạnh rằng bạn cởi mở thảo luận dựa trên toàn bộ gói phúc lợi (thưởng KPI, cổ phiếu, bảo hiểm sức khỏe và lộ trình thăng tiến).",
    imageUrl:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "faq-4",
    question: "Làm sao để chuyển ngành (Career Switch) thành công khi chưa có kinh nghiệm?",
    answer:
      "Tập trung làm nổi bật các 'kỹ năng chuyển giao' (Transferable Skills) như tư duy phản biện, quản lý dự án, kỹ năng phân tích và giao tiếp. Xây dựng các dự án thực tế cá nhân (Side Projects hoặc Portfolio) để chứng minh năng lực thực chiến và hoàn thành các chứng chỉ chuyên ngành có giá trị kiểm định cao.",
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "faq-5",
    question: "AI đang thay đổi quy trình tuyển dụng và đánh giá ứng viên như thế nào?",
    answer:
      "Các nền tảng tuyển dụng hiện đại như SmartHire ứng dụng AI để phân tích ngữ nghĩa CV và so khớp độ tương đồng với JD bằng vector embeddings. Tuy nhiên, AI chỉ đóng vai trò hỗ trợ sàng lọc; quyết định phỏng vấn và đánh giá sự phù hợp về văn hóa, đạo đức nghề nghiệp và tư duy giải quyết vấn đề vẫn phụ thuộc vào con người.",
    imageUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
  },
];

export default function CareerBlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("smarthire_blog_bookmarks");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("smarthire_blog_likes");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Lưu bookmarks vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "smarthire_blog_bookmarks",
        JSON.stringify(Array.from(bookmarkedIds)),
      );
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedIds]);

  // Lưu likes vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "smarthire_blog_likes",
        JSON.stringify(Array.from(likedPosts)),
      );
    } catch (e) {
      console.error(e);
    }
  }, [likedPosts]);

  const handleToggleBookmark = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        toast({ description: "Đã bỏ lưu bài viết" });
      } else {
        next.add(postId);
        toast({ description: "Đã lưu bài viết vào danh sách yêu thích" });
      }
      return next;
    });
  };

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
        toast({ description: "Cảm ơn bạn đã thích bài viết này!" });
      }
      return next;
    });
  };

  const handleCopyLink = (post: BlogPost) => {
    const url = `${window.location.origin}${PATHS.BLOG}#${post.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      toast({ description: "Đã sao chép liên kết bài viết vào bộ nhớ tạm!" });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast({
        variant: "destructive",
        description: "Vui lòng nhập địa chỉ email hợp lệ!",
      });
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setNewsletterEmail("");
      toast({
        description:
          "Chúc mừng bạn đã đăng ký thành công bản tin nghề nghiệp SmartHire!",
      });
    }, 600);
  };

  // Top 3 bài viết nổi bật dùng cho Hero Slider
  const featuredSlides = useMemo(() => {
    const featured = BLOG_POSTS.filter((p) => p.isFeatured || p.isTrending);
    return featured.length >= 3 ? featured.slice(0, 3) : BLOG_POSTS.slice(0, 3);
  }, []);

  const currentHeroPost = featuredSlides[heroSlideIndex] || featuredSlides[0];

  // Lọc bài viết
  const filteredPosts = useMemo(() => {
    let list = BLOG_POSTS;

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.categorySlug === selectedCategory);
    }

    if (selectedTag) {
      list = list.filter((p) => p.tags.includes(selectedTag));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.author.name.toLowerCase().includes(q),
      );
    }

    return list;
  }, [selectedCategory, selectedTag, searchQuery]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg">
      {/* 1. ARTISTIC EDITORIAL HERO MASTHEAD */}
      <section className="relative w-full border-b border-border/80 bg-surface pt-24 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col px-4 sm:px-6 xl:px-8">
          {/* Masthead Header: Split Heading + Subtitle */}
          <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-12">
            <div className="sm:col-span-7">
              <h1 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl lg:text-5xl xl:text-6xl">
                Sustainable Career Insights
              </h1>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-5 sm:pl-4">
              <p className="text-xs text-text-muted leading-relaxed sm:text-sm">
                Chúng tôi chia sẻ các chiến lược phát triển sự nghiệp bền vững,
                phân tích thị trường lao động và góc nhìn thực chiến từ các chuyên
                gia nhân sự hàng đầu.
              </p>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("trending-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Khám phá bài viết mới</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Panoramic Hero Image / Slider */}
          <div className="mt-8 flex flex-col gap-4">
            <div
              onClick={() => setReadingPost(currentHeroPost)}
              className="group relative aspect-16/9 w-full cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-slate-100 sm:aspect-21/9"
            >
              <img
                src={currentHeroPost.imageUrl}
                alt={currentHeroPost.title}
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Minimalist Info Overlay at bottom of Hero */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent p-6 text-white sm:p-10">
                <div className="flex max-w-3xl flex-col gap-2">
                  <span className="text-xs font-semibold tracking-wider text-sky-300 uppercase">
                    {currentHeroPost.category} • {currentHeroPost.readTime}
                  </span>
                  <h2 className="text-xl font-bold leading-tight sm:text-2xl lg:text-3xl">
                    {currentHeroPost.title}
                  </h2>
                  <p className="hidden text-xs text-slate-200 line-clamp-2 sm:block sm:text-sm">
                    {currentHeroPost.excerpt}
                  </p>
                </div>
              </div>
            </div>

            {/* Slider Dots Indicator */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {featuredSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHeroSlideIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`size-2.5 rounded-full transition-all duration-300 ${
                    heroSlideIndex === idx
                      ? "w-8 bg-primary"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR TRENDING ARTICLE SECTION */}
      <section
        id="trending-section"
        className="mx-auto w-full max-w-[1600px] px-4 pt-14 pb-12 sm:px-6 xl:px-8"
      >
        {/* Section Heading & Subtitle */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl lg:text-4xl">
            Our Trending Article
          </h2>
          <p className="max-w-2xl text-xs text-text-muted leading-relaxed sm:text-sm">
            Tuyển tập các bài phân tích được quan tâm nhất về kỹ năng ứng tuyển,
            tối ưu CV chuẩn hóa và xu hướng công nghệ trong thị trường tuyển dụng hiện đại.
          </p>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="mt-8 flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {BLOG_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setSelectedTag(null);
                  }}
                  className={`relative cursor-pointer rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "border border-border/80 bg-surface text-text-muted hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Quick Search Input */}
          <div className="flex w-full sm:w-72 items-center rounded-xl border border-border/80 bg-surface px-3 py-1.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
            <Search className="size-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full bg-transparent px-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-text-muted hover:text-text-main"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. MINIMALIST ARTISTIC CARD GRID (Clean, breathable, no heavy container borders) */}
        <div className="pt-8">
          {filteredPosts.length === 0 ? (
            <div className="flex min-h-80 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/50 p-8 text-center">
              <img
                src={EmptyStreet}
                alt="Không tìm thấy bài viết"
                className="h-36 w-auto object-contain"
              />
              <h3 className="mt-4 text-base font-semibold text-text-main">
                Không tìm thấy bài viết phù hợp
              </h3>
              <p className="mt-1 max-w-sm text-xs text-text-muted leading-relaxed">
                Thử tìm kiếm với từ khóa khác hoặc thiết lập lại bộ lọc để khám phá các bài viết hữu ích.
              </p>
              <Button
                variant="secondary"
                className="mt-4 rounded-full! px-4! py-2! text-xs!"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedTag(null);
                  setSearchQuery("");
                }}
              >
                Xem tất cả bài viết
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
              {filteredPosts.map((post) => {
                const isBookmarked = bookmarkedIds.has(post.id);
                return (
                  <article
                    key={post.id}
                    onClick={() => setReadingPost(post)}
                    className="group flex cursor-pointer flex-col"
                  >
                    {/* Rounded Image with Smooth Scale */}
                    <div className="aspect-16/10 w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-100">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                    </div>

                    {/* Metadata & Title under Image (Clean Minimalist Editorial) */}
                    <div className="mt-4 flex flex-1 flex-col justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-primary">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-text-muted">
                            <Clock className="size-3" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="line-clamp-2 text-base font-bold leading-snug text-text-main transition-colors group-hover:text-primary">
                          {post.title}
                        </h3>

                        <p className="line-clamp-2 text-xs font-normal text-text-muted leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Action: Learn More with Circular Arrow Button */}
                      <div className="mt-4 flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text-main transition-colors group-hover:text-primary">
                            Learn more
                          </span>
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                            <ArrowUpRight className="size-3.5" />
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleToggleBookmark(e, post.id)}
                          aria-label="Lưu bài viết"
                          className="flex size-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-slate-100 hover:text-primary active:scale-95"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="size-4 text-primary" />
                          ) : (
                            <Bookmark className="size-4 text-text-muted" />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. HAVE A QUESTION? WE ARE HERE TO ANSWER (INTERACTIVE ACCORDION WITH SPLIT IMAGE) */}
      <section className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 xl:px-8 border-t border-border/80">
        {/* Section Header */}
        <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-12 pb-8">
          <div className="sm:col-span-7">
            <h2 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl lg:text-4xl">
              Have a question?
              <br />
              We are here to answer.
            </h2>
          </div>
          <div className="sm:col-span-5 sm:pl-4">
            <p className="text-xs text-text-muted leading-relaxed sm:text-sm">
              Tổng hợp những giải đáp chuyên sâu và hữu ích nhất giúp bạn giải quyết
              mọi thắc mắc trong quá trình tạo lập hồ sơ và chuẩn bị phỏng vấn tuyển dụng.
            </p>
          </div>
        </div>

        {/* Interactive Accordion List */}
        <div className="flex flex-col divide-y divide-border/80">
          {CAREER_FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} className="py-5 sm:py-6">
                {/* Accordion Trigger Row */}
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="flex w-full cursor-pointer items-center justify-between text-left transition-colors hover:text-primary"
                >
                  <span className="text-base font-bold text-text-main sm:text-lg">
                    {faq.question}
                  </span>
                  <span className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-surface text-text-muted transition-colors hover:border-primary hover:text-primary">
                    {isOpen ? (
                      <Minus className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </span>
                </button>

                {/* Accordion Expandable Content with Split Image (As in Reference Photo) */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-6 pt-5 sm:grid-cols-12 sm:gap-8 sm:pt-6">
                        {/* Text explanation */}
                        <div className="flex flex-col gap-3 sm:col-span-7">
                          <p className="text-xs text-text-muted leading-relaxed sm:text-sm sm:leading-loose">
                            {faq.answer}
                          </p>
                          <div className="pt-2">
                            <Link to={PATHS.SEARCH_JOB}>
                              <Button
                                variant="secondary"
                                className="rounded-xl! text-xs!"
                              >
                                Tìm cơ hội việc làm liên quan
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Accompanying High-Resolution Photo */}
                        <div className="sm:col-span-5">
                          <div className="aspect-16/10 w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-100">
                            <img
                              src={faq.imageUrl}
                              alt={faq.question}
                              className="size-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. POPULAR KEYWORDS CLOUD */}
      <section className="mx-auto mb-16 w-full max-w-[1600px] px-4 sm:px-6 xl:px-8">
        <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8">
          <h3 className="text-base font-bold text-text-main sm:text-lg">
            Từ khóa nghề nghiệp được quan tâm
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Khám phá các chủ đề được ứng viên và nhà tuyển dụng tìm kiếm nhiều nhất hiện nay.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSelectedTag(selectedTag === tag ? null : tag);
                  const el = document.getElementById("trending-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-white"
                    : "border border-border/80 bg-bg text-text-muted hover:border-primary/40 hover:text-primary"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 6. EDITORIAL NEWSLETTER CTA (Matching Reference Photo) */}
      <section className="w-full border-t border-border/80 bg-slate-900 py-12 text-white sm:py-16">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center xl:px-8">
          <div className="flex max-w-lg flex-col gap-2">
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
              Nhận bản tin hướng nghiệp hàng tuần
            </h3>
            <p className="text-xs text-slate-300 sm:text-sm">
              Cập nhật các bài viết mới nhất, phân tích thị trường lao động và bí quyết
              ứng tuyển thực chiến từ ban biên tập SmartHire.
            </p>
          </div>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex w-full max-w-md items-center rounded-full border border-slate-700 bg-slate-800/80 p-1.5 focus-within:border-primary"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Nhập địa chỉ email của bạn..."
              className="w-full bg-transparent px-4 text-xs text-white placeholder:text-slate-400 focus:outline-none sm:text-sm"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              aria-label="Đăng ký nhận tin"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <ArrowUpRight className="size-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 7. INTERACTIVE ARTICLE READER DRAWER / MODAL */}
      <AnimatePresence>
        {readingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReadingPost(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Reader Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-border/80 bg-surface"
            >
              {/* Header Drawer */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-3.5 backdrop-blur-md">
                <span className="rounded-full bg-secondary/30 px-3 py-1 text-xs font-semibold text-primary-dark">
                  {readingPost.category}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(readingPost)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-text-muted hover:bg-slate-100 hover:text-text-main"
                    title="Sao chép liên kết"
                  >
                    {isCopied ? (
                      <Check className="size-4 text-status-success" />
                    ) : (
                      <Share2 className="size-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleBookmark(e, readingPost.id)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-text-muted hover:bg-slate-100 hover:text-text-main"
                    title="Lưu bài viết"
                  >
                    <motion.div
                      key={bookmarkedIds.has(readingPost.id) ? "saved" : "unsaved"}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {bookmarkedIds.has(readingPost.id) ? (
                        <BookmarkCheck className="size-4 text-primary" />
                      ) : (
                        <Bookmark className="size-4 text-text-muted" />
                      )}
                    </motion.div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReadingPost(null)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-text-muted hover:bg-slate-100 hover:text-text-main"
                    aria-label="Đóng"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Reader Body */}
              <div className="flex flex-col gap-6 p-6 sm:p-8">
                <div>
                  <h1 className="text-xl font-bold leading-snug text-text-main sm:text-2xl lg:text-3xl">
                    {readingPost.title}
                  </h1>

                  {/* Author meta */}
                  <div className="mt-4 flex items-center gap-3">
                    <img
                      src={readingPost.author.avatar}
                      alt={readingPost.author.name}
                      className="size-11 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-text-main">
                        {readingPost.author.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {readingPost.author.role} • {readingPost.publishedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hero image inside post */}
                <div className="aspect-16/9 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={readingPost.imageUrl}
                    alt={readingPost.title}
                    className="size-full object-cover"
                  />
                </div>

                {/* Excerpt callout */}
                <blockquote className="rounded-2xl border border-border/80 bg-slate-50/70 p-5 text-xs font-normal text-text-muted italic sm:text-sm">
                  "{readingPost.excerpt}"
                </blockquote>

                {/* Article body paragraphs */}
                <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-700 sm:text-sm sm:leading-loose">
                  {readingPost.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Tags inside reader */}
                <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
                  <span className="text-xs font-semibold text-text-muted">
                    Thẻ liên quan:
                  </span>
                  {readingPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Reader Footer Actions */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(readingPost.id)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                        likedPosts.has(readingPost.id)
                          ? "bg-primary text-white"
                          : "border border-border bg-surface text-text-muted hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      <ThumbsUp className="size-3.5" />
                      <span>
                        Hữu ích (
                        {readingPost.likes +
                          (likedPosts.has(readingPost.id) ? 1 : 0)}
                        )
                      </span>
                    </button>
                  </div>

                  <Button
                    variant="secondary"
                    className="rounded-full! text-xs!"
                    onClick={() => handleCopyLink(readingPost)}
                  >
                    <Share2 className="size-3.5" />
                    Chia sẻ bài viết
                  </Button>
                </div>

                {/* Related CTA banner in Drawer */}
                <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary p-4 text-white">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold">
                      Sẵn sàng ứng tuyển?
                    </span>
                    <span className="text-[11px] text-slate-200">
                      Tạo CV chuẩn ATS và tìm việc làm phù hợp ngay hôm nay.
                    </span>
                  </div>
                  <Link to={PATHS.SEARCH_JOB}>
                    <Button className="rounded-xl! bg-white! px-3! py-1.5! text-xs! font-bold! text-primary! hover:bg-slate-100!">
                      Khám phá
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
