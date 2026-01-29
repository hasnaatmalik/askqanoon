export function Footer() {
    return (
        <footer id="disclaimer" className="border-t border-border/40 bg-background py-12">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="font-serif text-xl font-bold italic">
                            Ask<span className="text-secondary-foreground">Qanoon</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Empowering Pakistani citizens with accessible legal information through modern AI asssistance.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Pakistan Penal Code</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Criminal Procedure Code</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Family Laws Manual</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">PECA 2016</a></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-foreground">Official Disclaimer</h4>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                AskQanoon provides legal <strong>information</strong>, not legal <strong>advice</strong>. Always consult with a qualified legal professional for your specific situation. We do not provide verdicts or guarantees.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-border/20 pt-8 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} AskQanoon Project. Built for Innovation.</p>
                </div>
            </div>
        </footer>
    );
}
