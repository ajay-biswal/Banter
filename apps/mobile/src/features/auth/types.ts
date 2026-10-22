export type LoginFormValues = {
  email: string;
  password: string;
};

export type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

export type SignupFormErrors = Partial<Record<keyof SignupFormValues, string>>;