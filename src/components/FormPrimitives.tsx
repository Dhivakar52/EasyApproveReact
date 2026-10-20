import type { ReactNode } from "react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

export interface FieldLabelProps {
  children: ReactNode;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}

export function FieldLabel({
  children,
  required,
  className,
  htmlFor,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-xs font-semibold text-gray-600 mb-1", className)}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  span?: number;
  error?: string;
  hint?: string;
}

export function Field({
  label,
  required,
  children,
  className,
  span,
  error,
  hint,
}: FieldProps) {
  return (
    <div
      className={cn("space-y-1", className)}
      style={span ? { gridColumn: `span ${span} / span ${span}` } : undefined}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-500">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export interface TextFieldProps {
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  type?: string;
  autoFocus?: boolean;
}

export function TextField({
  id,
  name,
  placeholder,
  disabled,
  value,
  defaultValue,
  onChange,
  className,
  type = "text",
  autoFocus,
}: TextFieldProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      value={value !== undefined ? value : undefined}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-100",
        className
      )}
    />
  );
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: readonly (string | SelectOption)[];
  className?: string;
}

export function SelectField({
  id,
  name,
  placeholder = "Select",
  disabled,
  value,
  defaultValue,
  onChange,
  options = [],
  className,
}: SelectFieldProps) {
  const [internalVal, setInternalVal] = useState<string>(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentVal = isControlled ? (value ?? "") : internalVal;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    if (!isControlled) {
      setInternalVal(newVal);
    }
    onChange?.(newVal);
  };

  return (
    <select
      id={id}
      name={name}
      disabled={disabled}
      value={currentVal}
      onChange={handleChange}
      className={cn(
        "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-100",
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const lbl = typeof opt === "string" ? opt : opt.label;
        return (
          <option key={val} value={val}>
            {lbl}
          </option>
        );
      })}
    </select>
  );
}

export interface DateFieldProps {
  id?: string;
  name?: string;
  placeholder?: string;
  defaultLabel?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

export function DateField({
  id,
  placeholder = "Select date",
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  min,
  max,
}: DateFieldProps) {
  const [internalVal, setInternalVal] = useState<string>(defaultValue || "");
  const currentValue = value !== undefined ? value : internalVal;

  const handleChange = (d: string) => {
    setInternalVal(d);
    onChange?.(d);
  };

  return (
    <DatePicker
      id={id}
      placeholder={placeholder}
      value={currentValue}
      onChange={handleChange}
      disabled={disabled}
      minDate={min}
      maxDate={max}
      className={className}
      allowClear
    />
  );
}

export interface DobDateFieldProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DobDateField({
  id,
  name,
  placeholder = "Select Date of Birth",
  value,
  defaultValue,
  onChange,
  disabled,
  className,
}: DobDateFieldProps) {
  const maxDate = new Date().toISOString().split("T")[0];
  return (
    <DateField
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      disabled={disabled}
      className={className}
      max={maxDate}
    />
  );
}

export interface TextAreaFieldProps {
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  rows?: number;
  className?: string;
}

export function TextAreaField({
  id,
  name,
  placeholder,
  disabled,
  value,
  defaultValue,
  onChange,
  rows = 3,
  className,
}: TextAreaFieldProps) {
  return (
    <textarea
      id={id}
      name={name}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      value={value !== undefined ? value : undefined}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-100 resize-y",
        className
      )}
    />
  );
}

export interface CheckboxFieldProps {
  id?: string;
  name?: string;
  label: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField({
  id,
  name,
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
  className,
}: CheckboxFieldProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 select-none",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span>{label}</span>
    </label>
  );
}
