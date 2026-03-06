'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { usersAPI } from '@/lib/api';
import { MembershipLevel, MembershipLevelLabels, PublicProfile, Role } from '@/lib/types';
import { getImageUrl, getProfileImageUrl } from '@/lib/helpers';
import { Loader2, Users, Globe, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await usersAPI.listPublicProfiles();
      const filteredMembers = data.filter((member) => {
        if (!member.name) return true;
        return member.name.trim().toLowerCase() !== 'admin';
      });
      setMembers(filteredMembers);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError('Гишүүдийн мэдээллийг ачаалж чадсангүй.');
    } finally {
      setIsLoading(false);
    }
  };

  const honoraryMembers = members.filter(
    (member) => member.membershipLevel === MembershipLevel.HONORARY_MEMBER
  );
  const regularMembers = members.filter(
    (member) => member.membershipLevel !== MembershipLevel.HONORARY_MEMBER
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-[#e63946]/20 blur-[120px] rounded-full" />
          
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
              <Users className="h-4 w-4 text-[#e63946]" />
              <span className="text-sm font-medium text-white">Манай баг</span>
            </div>
            
            <h1 className="fade-up text-4xl sm:text-5xl font-bold text-white leading-tight">
              Гишүүд
            </h1>
            
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Эдийн засагчдын клубийн идэвхтэй гишүүд болон хүндэт гишүүд
            </p>
          </div>
        </section>

        {/* Members Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-[#e63946] mx-auto" />
                  <p className="mt-4 text-sm text-gray-500">Гишүүдийг ачаалж байна...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-red-700">{error}</p>
              </div>
            ) : members.length === 0 ? (
              <div className="premium-card p-12 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Гишүүд олдсонгүй</h3>
                <p className="text-gray-600">Одоогоор бүртгэлтэй гишүүн байхгүй байна.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <p className="text-gray-600">
                    Нийт <span className="font-semibold text-gray-900">{members.length}</span> гишүүн
                  </p>
                </div>

                {regularMembers.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Гишүүд</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {regularMembers.map((member) => (
                        <MemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </>
                )}

                {honoraryMembers.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Хүндэт гишүүд</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {honoraryMembers.map((member) => (
                        <MemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function MemberCard({ member }: { member: PublicProfile }) {
  const membershipLabel = member.membershipLevel
    ? MembershipLevelLabels[member.membershipLevel]
    : 'Гишүүн';
  const roleLabel = member.role === Role.ADMIN ? 'Админ' : 'Хэрэглэгч';

  return (
    <Link href={`/profile/${member.id}`} className="group">
      <div className="premium-card p-6 card-hover h-full">
        {/* Profile Picture */}
        <div className="relative mx-auto w-24 h-24 mb-4">
          {(member.profilePicturePath || member.profilePicture) ? (
            <img
              src={getProfileImageUrl(member.profilePicturePath, member.profilePicture)}
              alt={member.name || 'Member'}
              className="w-full h-full rounded-full object-cover ring-4 ring-gray-100 group-hover:ring-[#e63946]/20 transition-all"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b6b] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-gray-100 group-hover:ring-[#e63946]/20 transition-all">
              {member.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="h-4 w-4 text-[#e63946]" />
          </div>
        </div>

        {/* Name */}
        <h3 className="text-center text-lg font-bold text-gray-900 group-hover:text-[#e63946] transition-colors">
          {member.name || 'Нэргүй гишүүн'}
        </h3>

        <p className="mt-1 text-center text-sm font-medium text-gray-700">
          {membershipLabel} · {roleLabel}
        </p>

        {/* About */}
        {member.aboutMe && (
          <p className="mt-2 text-center text-sm text-gray-600 line-clamp-2">
            {member.aboutMe}
          </p>
        )}

        {/* Social Links */}
        {(member.website || member.twitter || member.linkedin) && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {member.website && (
              <span className="p-2 rounded-full bg-gray-100 text-gray-500">
                <Globe className="h-4 w-4" />
              </span>
            )}
            {member.twitter && (
              <span className="p-2 rounded-full bg-gray-100 text-gray-500">
                <Twitter className="h-4 w-4" />
              </span>
            )}
            {member.linkedin && (
              <span className="p-2 rounded-full bg-gray-100 text-gray-500">
                <Linkedin className="h-4 w-4" />
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
