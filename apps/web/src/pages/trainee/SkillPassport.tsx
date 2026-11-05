import { useQuery } from '@tanstack/react-query';
import { Award, CheckCircle2, Clock3, Package, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const asArray = (value: any): any[] => Array.isArray(value) ? value : [];

export default function SkillPassport() {
  const { user } = useAuth();
  const traineeId = user?.trainee?.id;

  const { data: skills = [], isLoading: skillsLoading, isError: skillsError } = useQuery({
    queryKey: ['trainee-skill-passport', traineeId],
    queryFn: async () => asArray((await api.get(`/trainees/${traineeId}/skill-passport`)).data?.data),
    enabled: Boolean(traineeId),
  });
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['trainee-products', traineeId],
    queryFn: async () => asArray((await api.get(`/trainees/${traineeId}/products`)).data?.data),
    enabled: Boolean(traineeId),
  });
  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ['trainee-certificates', traineeId],
    queryFn: async () => asArray((await api.get(`/trainees/${traineeId}/certificates`)).data?.data),
    enabled: Boolean(traineeId),
  });

  const verifiedSkills = skills.filter((item: any) => item.status === 'VERIFIED');
  const learningSkills = skills.filter((item: any) => item.status !== 'VERIFIED');
  const verifiedCertificates = certificates.filter((item: any) => item.status === 'ISSUED');
  const loading = skillsLoading || productsLoading || certificatesLoading;

  if (!traineeId) {
    return <Card title="Skill Passport unavailable"><p className="text-sm text-amber-700">The signed-in account does not have a linked trainee profile. Sign in with a trainee account to view the Skill Passport.</p></Card>;
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size={32} /></div>;
  if (skillsError) return <Card title="Unable to load Skill Passport"><p className="text-sm text-red-600">The trainee skill records could not be retrieved. Refresh the page or contact the administrator.</p></Card>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-teal-800 px-6 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">KISS V-TRACK · Competency record</p>
          <h1 className="mt-2 text-3xl font-bold tracking-wide">Skill Passport</h1>
          <p className="mt-2 max-w-2xl text-sm text-indigo-100">A record of the skills learned, products created and certificates issued during vocational training.</p>
        </div>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Trainee</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="mt-1 text-sm text-gray-500">Student ID: {user?.trainee?.studentId || 'Not available'}</p>
          </div>
          <Badge color="blue">{user?.role || 'TRAINEE'}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><ShieldCheck size={22} /></div><div><p className="text-sm text-gray-500">Verified skills</p><p className="text-2xl font-bold text-gray-900">{verifiedSkills.length}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Package size={22} /></div><div><p className="text-sm text-gray-500">Products recorded</p><p className="text-2xl font-bold text-gray-900">{products.length}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-3 text-amber-700"><Award size={22} /></div><div><p className="text-sm text-gray-500">Certificates issued</p><p className="text-2xl font-bold text-gray-900">{verifiedCertificates.length}</p></div></div></Card>
      </div>

      <Card title="Verified competencies" description="Skills marked as verified by an authorised trainer.">
        {verifiedSkills.length === 0 ? <p className="py-4 text-sm text-gray-500">No skills have been verified yet.</p> : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {verifiedSkills.map((item: any) => <div key={item.id} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} /><div className="min-w-0"><p className="font-semibold text-gray-900">{item.skill?.name || 'Skill'}</p><p className="mt-0.5 text-xs text-gray-500">{item.skill?.category?.name || 'Uncategorised'} · {item.level || 'Level not specified'}</p>{item.dateVerified && <p className="mt-1 text-xs text-emerald-700">Verified {new Date(item.dateVerified).toLocaleDateString()}</p>}</div></div>)}
          </div>
        )}
      </Card>

      <Card title="Skills in progress" description="Skills that are still being learned or practised.">
        {learningSkills.length === 0 ? <p className="py-4 text-sm text-gray-500">No skills are currently in progress.</p> : (
          <div className="space-y-4">
            {learningSkills.map((item: any) => <div key={item.id}>
              <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-medium text-gray-900">{item.skill?.name || 'Skill'}</p><p className="text-xs text-gray-500">{item.skill?.category?.name || 'Uncategorised'}</p></div><Badge color="gray">{String(item.status || 'LEARNING').replace(/_/g, ' ')}</Badge></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.max(0, Math.min(100, Number(item.progressPct || 0)))}%` }} /></div>
              <p className="mt-1 text-right text-xs text-gray-500">{Math.max(0, Math.min(100, Number(item.progressPct || 0)))}% complete</p>
            </div>)}
          </div>
        )}
      </Card>

      <Card title="Certificates" description="Certificates issued to this trainee.">
        {verifiedCertificates.length === 0 ? <p className="py-3 text-sm text-gray-500">No certificates have been issued yet.</p> : <div className="divide-y">{verifiedCertificates.map((certificate: any) => <div key={certificate.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium text-gray-900">{certificate.title}</p><p className="text-xs text-gray-500">{certificate.certificateNo} · Issued {new Date(certificate.issueDate).toLocaleDateString()}</p></div><Badge color="green">Issued</Badge></div>)}</div>}
      </Card>

      {skills.length === 0 && products.length === 0 && certificates.length === 0 && <Card><div className="flex items-center gap-3 text-sm text-gray-500"><Clock3 size={18} />Your verified competencies and achievements will appear here as training records are added.</div></Card>}
    </div>
  );
}
