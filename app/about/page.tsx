'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { categoriesAPI, postsAPI, usersAPI } from '@/lib/api';
import { MembershipLevel, PostStatus, PublicProfile, Visibility } from '@/lib/types';
import { getProfileImageUrl } from '@/lib/helpers';
import { Users, Target, BookOpen, Mic, Calendar, GraduationCap, Sparkles, Award, Building2 } from 'lucide-react';

const activities = [
  {
    icon: GraduationCap,
    title: 'Академик сургалт',
    description: 'Клубийн гишүүдийн мэргэжлийн ур чадварыг хөгжүүлэх бүхий л төрлийн сургалтыг дотооддоо орохоос гадна төгсөгчдийг урьж авчран туршлага судалдаг.',
  },
  {
    icon: BookOpen,
    title: 'Эдийн засгийн контент',
    description: 'Өөрсдийн мэдлэг, ур чадварыг ашиглан хүн бүрд хэрэгцээтэй, мэдүүштэй эдийн засгийн контентуудыг бэлтгэн хүргэдэг.',
  },
  {
    icon: Sparkles,
    title: 'Давтлага, хичээл',
    description: 'СЭЗИС-ийн нийт оюутан залуусд зориулан улирал бүр эдийн засгийн хичээлүүдийн хүрээнд нээлттэй давтлага, сургалт ордог.',
  },
  {
    icon: Users,
    title: 'Чөлөөт үйл ажиллагаа',
    description: 'Гишүүдийн soft skill-ийг хөгжүүлэхийн зэрэгцээ сургуулийн орчинд төрөл бүрийн идэвхтэй арга хэмжээнд оролцдог.',
  },
  {
    icon: Calendar,
    title: 'Арга хэмжээ',
    description: 'Улирал бүр клубийн зүгээс оюутнуудад зориулан мэргэжлийн уралдаан тэмцээнүүдийг зохион байгуулдаг.',
  },
  {
    icon: Mic,
    title: 'Ярилцлага',
    description: 'Тэнхимийн төгсөгч болон багш, эрдэмтийг урьж оролцуулан тэдгээрийн ажил амьдралын үнэтэй туршлагуудыг сонсон контент болгон түгээдэг.',
  },
];

const alumni = [
  'Монголбанк',
  'Голомт банк',
  'Худалдаа Хөгжлийн банк',
  'Хөгжлийн банк',
  'VMC Holding',
  'Total Distribution LLC',
  'ХасБанк',
  'Premium Nexus ХК',
  'Санхүү эдийн засгийн их сургууль',
  'Юнител Групп',
  'Ард Секьюритиз',
  'Инвескор ББСБ ХК',
];

export default function AboutPage() {
  const [articleCount, setArticleCount] = useState(0);
  const [contentTypeCount, setContentTypeCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [previewMembers, setPreviewMembers] = useState<PublicProfile[]>([]);
  const [activeMemberLevel, setActiveMemberLevel] = useState<'BOARD' | 'CORE' | 'HONORARY'>('BOARD');

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadAllPublishedPosts = async () => {
    const allPosts: Awaited<ReturnType<typeof postsAPI.list>> = [];
    let skip = 0;
    const take = 100;

    while (true) {
      const batch = await postsAPI.list({
        status: PostStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        sort: 'PUBLISHED_AT_DESC',
        take,
        skip,
      });

      allPosts.push(...batch);

      if (batch.length < take) break;
      skip += take;
      if (skip >= 2000) break;
    }

    return allPosts;
  };

  const loadSystemStats = async () => {
    try {
      const [categories, members, posts] = await Promise.all([
        categoriesAPI.list(),
        usersAPI.listPublicProfiles(),
        loadAllPublishedPosts(),
      ]);

      const filteredMembers = members.filter((member) => {
        if (!member.name) return true;
        return member.name.trim().toLowerCase() !== 'admin';
      });

      const events = posts.filter((post) =>
        post.categories?.some((category) => {
          const text = `${category.slug} ${category.name}`.toLowerCase();
          return (
            text.includes('event') ||
            text.includes('events') ||
            text.includes('arga') ||
            text.includes('hemjee') ||
            text.includes('арга') ||
            text.includes('хэмж')
          );
        })
      ).length;

      setArticleCount(posts.length);
      setContentTypeCount(categories.length);
      setEventCount(events);
      setMemberCount(filteredMembers.length);
      setPreviewMembers(filteredMembers.slice(0, 8));
    } catch (error) {
      console.error('Failed to load about stats:', error);
    }
  };

  const stats = useMemo(
    () => [
      { value: String(articleCount), label: 'Нийтлэлүүд сошиал орчинд' },
      { value: String(contentTypeCount), label: 'Төрлийн контент, бүтээлүүд' },
      { value: String(eventCount), label: 'Удаагийн арга хэмжээ' },
      { value: String(memberCount), label: 'Нийт гишүүд' },
    ],
    [articleCount, contentTypeCount, eventCount, memberCount]
  );

  const previewByLevel = useMemo(() => {
    if (activeMemberLevel === 'BOARD') {
      return previewMembers.filter((member) => member.membershipLevel === MembershipLevel.BOARD_MEMBER);
    }
    if (activeMemberLevel === 'HONORARY') {
      return previewMembers.filter((member) => member.membershipLevel === MembershipLevel.HONORARY_MEMBER);
    }
    return previewMembers.filter(
      (member) =>
        member.membershipLevel === MembershipLevel.MEMBER ||
        member.membershipLevel === MembershipLevel.REGULAR_USER ||
        !member.membershipLevel
    );
  }, [activeMemberLevel, previewMembers]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#e63946]/20 blur-[120px] rounded-full" />
          
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8">
              <Award className="h-4 w-4 text-[#e63946]" />
              <span className="text-sm font-medium text-white">СЭЗИС-ийн дэргэдэх клуб</span>
            </div>
            
            <h1 className="fade-up text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Эдийн засагчдын клубт{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] to-[#ff6b6b]">
                тавтай морил
              </span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Өөрсдийн сонирхлоо нээн хөгжүүлж, хамтдаа тасралтгүй хичээн суралцаж гишүүд болон нийгэмдээ үнэ цэнийг бүтээнэ.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative -mt-12 z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="premium-card p-6 text-center">
                <p className="text-3xl sm:text-4xl font-bold text-[#e63946]">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-2">Бидний тухай</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                СЭЗИС-ийн дэргэдэх Эдийн засагчдын клуб
              </h2>
            </div>

            <div className="premium-card p-8 sm:p-10">
              <p className="text-gray-700 leading-relaxed text-lg">
                Эдийн засагчдын клуб нь <strong>2019 оны 3-р сард</strong> байгуудагдсан. Анх СЭЗИС-н Экономиксийн тэнхимийн багш С. Өнөр, Экономиксийн тэнхимийн оюутнууд болох Э. Хосбаяр, Э. Тамир, Х. Төгсбуян нарын бүрэлдэхүүнтэй байгуулагдсан юм.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed text-lg">
                Үүнээс хойш нийт <strong>9 удаагийн элсэлт</strong> авсан бөгөөд <strong>24 үндсэн гишүүн</strong>, <strong>25 хүндэт гишүүнтэйгээр</strong> үйл ажиллагаагаа явуулж байна.
              </p>

              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[#e63946]/10 to-[#ff6b6b]/10 border border-[#e63946]/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e63946] flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-1">Алсын хараа</p>
                    <p className="text-xl font-bold text-gray-900">МОНГОЛ ОЮУНААР ДЭЛХИЙГ ТЭТГЭНЭ</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="font-semibold text-gray-900">Судалгаа шинжилгээ</p>
                  <p className="mt-1 text-sm text-gray-600">хийх</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="font-semibold text-gray-900">Илтгэл хэлэлцүүлэг</p>
                  <p className="mt-1 text-sm text-gray-600">өрнүүлэх</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="font-semibold text-gray-900">Арга хэмжээ</p>
                  <p className="mt-1 text-sm text-gray-600">зохион байгуулах</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-2">Бидний үйл ажиллагаа</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Манай клубын чиглэлүүд
              </h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Манай клуб нь дараах чиглэлээр уулзалтаа хийж, үйл ажиллагаагаа явлуулдаг
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div key={activity.title} className="premium-card p-6 card-hover">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center mb-4">
                    <activity.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{activity.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alumni Section */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-2">Төгсөгчид</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Төгсөгчид хаана ажиллаж байна вэ?
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {alumni.map((company) => (
                <div
                  key={company}
                  className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:border-[#e63946] hover:text-[#e63946] transition-colors"
                >
                  <Building2 className="h-4 w-4 inline mr-2" />
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Members Preview */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-2">Гишүүдийн тойм</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Манай гишүүд</h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Эдийн засагчдын клубийн гишүүдээс онцолж танилцуулж байна
              </p>
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setActiveMemberLevel('BOARD')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeMemberLevel === 'BOARD'
                    ? 'bg-[#e63946] text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#e63946]'
                }`}
              >
                Удирдах зөвлөл
              </button>
              <button
                onClick={() => setActiveMemberLevel('CORE')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeMemberLevel === 'CORE'
                    ? 'bg-[#e63946] text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#e63946]'
                }`}
              >
                Үндсэн гишүүд
              </button>
              <button
                onClick={() => setActiveMemberLevel('HONORARY')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeMemberLevel === 'HONORARY'
                    ? 'bg-[#e63946] text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#e63946]'
                }`}
              >
                Хүндэт гишүүд
              </button>
            </div>

            {previewByLevel.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {previewByLevel.map((member) => (
                    <Link key={member.id} href={`/profile/${member.id}`} className="group">
                      <div className="premium-card p-6 card-hover h-full text-center">
                        <div className="relative mx-auto w-20 h-20 mb-4">
                          {(member.profilePicturePath || member.profilePicture) ? (
                            <img
                              src={getProfileImageUrl(member.profilePicturePath, member.profilePicture)}
                              alt={member.name || 'Member'}
                              className="w-full h-full rounded-full object-cover ring-4 ring-gray-100 group-hover:ring-[#e63946]/20 transition-all"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center text-white text-xl font-bold ring-4 ring-gray-100 group-hover:ring-[#e63946]/20 transition-all">
                              {member.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#e63946] transition-colors line-clamp-1">
                          {member.name || 'Нэргүй гишүүн'}
                        </h3>

                        {member.aboutMe && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{member.aboutMe}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-10 text-center">
                  <Link
                    href="/members"
                    className="inline-flex items-center rounded-xl bg-[#e63946] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d62f3d] transition-colors"
                  >
                    Бүх гишүүдийг харах
                  </Link>
                </div>
              </>
            ) : (
              <div className="premium-card p-8 text-center text-gray-600">Гишүүдийн мэдээлэл ачаалж байна...</div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
