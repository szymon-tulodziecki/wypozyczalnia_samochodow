import Link from 'next/link';

export default function Header(){
    return(
        <header className="bg-slate-900 text-white p-4 shadow-md">
            <nav className='max-w-7xl mx-auto flex justify-between items-center'>
                <div className='text-xl font-bold'>
                    <Link href="/">
                        <h1>Miejsce na logo</h1>
                        <h2>Auto Rent</h2>
                    </Link>
                </div>
                <ul className='flex gap-6'>
                    <li><Link href="/" className="hover:text-blue-400">Strona Główna</Link></li>
                    <li><Link href="/samochody" className="hover:text-blue-400">Nasza Flota</Link></li>
                     <li><Link href="/kontakt" className="hover:text-blue-400">Kontakt</Link></li>
                </ul>
            </nav>
        </header>
    );
}