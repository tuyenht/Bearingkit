'use client';

import { useState } from 'react';

const SUCCESS_MESSAGE = 'Đăng kí thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.';

export default function SignupPage() {
  const [done, setDone] = useState(false);
  if (done) return <p role="status">{SUCCESS_MESSAGE}</p>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <input name="email" type="email" required />
      <button type="submit">Đăng ký</button>
    </form>
  );
}
