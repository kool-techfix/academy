import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';

export function FormField<TFieldValues extends FieldValues>({
  label,
  name,
  register,
  error,
  type = 'text',
  placeholder,
  readOnly = false,
  autoComplete,
}: {
  label: string;
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  error?: string;
  type?: string;
  placeholder: string;
  readOnly?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        readOnly={readOnly}
        autoComplete={autoComplete}
        {...register(name)}
        data-testid={`input-${name}`}
      />
      {error && (
        <div className="field-error" data-testid={`error-${name}`}>
          {error}
        </div>
      )}
    </div>
  );
}