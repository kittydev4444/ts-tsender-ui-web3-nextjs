export type InputFieldProps = {
  label: string
  placeholder?: string
  value: string
  type?: "text" | "number" | "password" | "email" | "textarea"
  large?: boolean
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
}

export default function InputField({
  label,
  placeholder,
  value,
  type = "text",
  large = false,
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-600">{label}</label>
      {large ? (
        <textarea
          className={`h-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 align-text-top text-zinc-900 shadow-xs placeholder:text-zinc-500 focus:ring-[4px] focus:ring-zinc-400/15 focus:outline-none`}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
        />
      ) : (
        <input
          className={`rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-xs placeholder:text-zinc-500 focus:ring-[4px] focus:ring-zinc-400/15 focus:outline-none`}
          type={type}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
        />
      )}
    </div>
  )
}
