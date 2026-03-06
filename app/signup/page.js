import SignUpForm from "../_components/SignUpForm";

export const metadata = {
    title: "Sign Up",
};

export default function Page() {
    return (
        <div className="flex flex-col gap-8 mt-10 items-center">
            <div className="text-center">
                <h2 className="text-3xl font-semibold mb-2">Create your account</h2>
                <p className="text-primary-400">
                    Join The Wild Oasis to book luxury cabins
                </p>
            </div>

            <SignUpForm />
        </div>
    );
}
