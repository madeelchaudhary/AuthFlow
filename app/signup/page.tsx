import Signup from "@/components/SignUp";
import { signUp } from "@/lib/auth";

const page = () => {
  return <Signup signUp={signUp} />;
};

export default page;
