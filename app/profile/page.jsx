import { Suspense } from "react";
import ProfileEditPage from "./useParams";

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileEditPage />
    </Suspense>
  );
}