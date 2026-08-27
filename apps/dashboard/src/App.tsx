import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Spinner } from "@/components/ui";
import { Login } from "@/pages/Login";

import { Overview } from "@/pages/admin/Overview";
import { Members } from "@/pages/admin/Members";
import { Events } from "@/pages/admin/Events";
import { Jobs } from "@/pages/admin/Jobs";
import { JobApplications } from "@/pages/admin/JobApplications";
import { Community } from "@/pages/admin/Community";
import { Mentors } from "@/pages/admin/Mentors";
import { MentorSessionsAdmin } from "@/pages/admin/MentorSessions";
import { MentorshipApplicationsAdmin } from "@/pages/admin/MentorshipApplications";

import { MyProfile } from "@/pages/mentor/MyProfile";
import { MySessions } from "@/pages/mentor/MySessions";
import { MyApplications } from "@/pages/mentor/MyApplications";

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Spinner />
    </div>
  );
}

function Protected() {
  const { session, profile, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!session || !profile) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route element={<Layout />}>
        {profile.role === "admin" ? (
          <>
            <Route index element={<Overview />} />
            <Route path="members" element={<Members />} />
            <Route path="events" element={<Events />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:roleId/applications" element={<JobApplications />} />
            <Route path="community" element={<Community />} />
            <Route path="mentors" element={<Mentors />} />
            <Route path="mentors/:mentorId/sessions" element={<MentorSessionsAdmin />} />
            <Route path="mentorship-applications" element={<MentorshipApplicationsAdmin />} />
          </>
        ) : (
          <>
            <Route index element={<MyProfile />} />
            <Route path="sessions" element={<MySessions />} />
            <Route path="applications" element={<MyApplications />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Protected />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
