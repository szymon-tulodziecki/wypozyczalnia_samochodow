import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatBot />
    </>
  );
}
