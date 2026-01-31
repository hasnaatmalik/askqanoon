import InheritanceCalculator from "@/components/inheritance/calculator";

export default function InheritancePage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inheritance Calculator</h1>
                    <p className="text-muted-foreground mt-1">Calculate legal heirs' shares according to Islamic Law (Hanafi).</p>
                </div>
            </div>
            <div className="flex-1">
                <InheritanceCalculator />
            </div>
        </div>
    );
}
