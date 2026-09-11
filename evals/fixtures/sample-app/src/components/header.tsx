type User = { name: string; profile?: { avatar?: string } };

export function Header({ user }: { user: User }) {
  const avatar = user.profile.avatar;
  return (
    <header>
      <img src={avatar ?? '/avatar-placeholder.png'} alt="" width={32} height={32} />
      <span>{user.name}</span>
    </header>
  );
}
