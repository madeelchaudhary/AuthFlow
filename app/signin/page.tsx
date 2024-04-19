import SignIn from "@/components/SignIn";
import { signIn } from "@/lib/auth";

const page = () => {
  return <SignIn signIn={signIn} />;
};

export default page;
