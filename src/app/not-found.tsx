import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-muted p-4 rounded-full mb-6">
                <FileQuestion className="w-12 h-12 text-muted-foreground" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
                Page Not Found
            </h2>

            <p className="text-muted-foreground mb-8 max-w-md">
                The page you are looking for doesn't exist or has been moved.
            </p>

            <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
            >
                <Home className="w-4 h-4" />
                Return Home
            </Link>
        </div>
    );
}
