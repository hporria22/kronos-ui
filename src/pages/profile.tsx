
import React from "react";
import { useAuth } from "../lib/auth";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { LogOut, Mail, Building2, ShieldCheck, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface RowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}

const Row: React.FC<RowProps> = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
    <span className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[color:var(--teal)] flex-shrink-0">
      <Icon className="w-4 h-4" />
    </span>
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className={`text-slate-900 truncate ${mono ? "mono" : ""}`}>{value}</div>
    </div>
  </div>
);

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  if (!user) return null;

  const handleLogout = (): void => {
    logout();
    toast.success("Signed out");
    nav("/login", { replace: true });
  };

  return (
    <div className="space-y-6 max-w-4xl" data-testid="profile-page">
      <div>
        <div className="k-stripe-gradient w-10 mb-3" />
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h2>
        <p className="text-[13.5px] text-slate-500 mt-1">
          Your Kronos account details and active session information.
        </p>
      </div>

      <section className="k-card">
        <div className="flex items-start gap-5 flex-wrap">
          <Avatar className="h-20 w-20 bg-[color:var(--teal)] text-white">
            <AvatarFallback className="bg-[color:var(--teal)] text-white text-[26px] font-semibold">
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-semibold text-slate-900">{user.name}</h3>
              <Badge className="bg-[#F0FDF9] text-[color:var(--teal)] border border-[color:var(--teal)]/30 hover:bg-[#F0FDF9]">
                {user.role}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <Row icon={Mail} label="Email" value={user.email} />
              <Row icon={Building2} label="Plant" value={user.plant} />
              <Row icon={ShieldCheck} label="Identity provider" value={user.provider} />
              <Row icon={KeyRound} label="User ID" value={user.id} mono />
            </div>
          </div>
          <Button
            variant="outline"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            onClick={handleLogout}
            data-testid="profile-logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </section>

      <section className="k-card">
        <h3 className="text-[15px] font-semibold text-slate-900 mb-4">Session</h3>
        <ul className="space-y-3 text-[13px] text-slate-700">
          <li className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Signed in at</span>
            <span className="mono">{new Date(user.loggedAt).toLocaleString()}</span>
          </li>
          <li className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Device</span>
            <span>Web · {navigator.platform}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-slate-500">Session expires</span>
            <span className="mono">8h remaining</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Profile;