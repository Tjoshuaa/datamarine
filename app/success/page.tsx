export default function SuccessPage({
  searchParams
}: {
  searchParams: { tracking?: string }
}) {
  return (
    <main className="max-w-3xl mx-auto p-10 text-center">

      <h1 className="text-4xl font-bold text-green-600">
        Order Successful 🎉
      </h1>

      <p className="mt-4 text-lg">
        Your tracking ID:
      </p>

      <h2 className="text-2xl font-bold mt-2">
        {searchParams.tracking}
      </h2>

      <p className="mt-6">
        We will contact you shortly.
      </p>

    </main>
  )
}