import { ragService } from "./src/services/rag/rag.service";
import { settlementService } from "./src/services/negotiation/settlement.service";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function testComplianceAndSettlement() {
    console.log("🧪 Testing Compliance and Settlement Services\n");
    console.log("=" + "=".repeat(70) + "\n");

    // Test 1: Compliance Matrix
    console.log("1️⃣  Testing Compliance Matrix...");
    try {
        const jurisdictions = ["Pakistan", "EU"];
        const topic = "Data Retention";
        console.log(`   Jurisdictions: ${jurisdictions.join(", ")}`);
        console.log(`   Topic: ${topic}`);

        const result = await ragService.compareRegulations(topic, jurisdictions);
        console.log("   ✅ Compliance Matrix Working!");
        console.log("   Result:", JSON.stringify(result, null, 2).substring(0, 300) + "...\n");
    } catch (error: any) {
        console.log("   ❌ FAILED:", error.message);
        console.log("   Stack:", error.stack?.substring(0, 500), "\n");
    }

    // Test 2: Settlement Analysis
    console.log("2️⃣  Testing Settlement Analysis...");
    try {
        const caseFacts = "Employment contract dispute over unpaid bonuses worth $50,000";
        const opponentHistory = "Aggressive litigator style";
        console.log(`   Case: ${caseFacts}`);

        const result = await settlementService.analyzeCase(caseFacts, opponentHistory);
        console.log("   ✅ Settlement Analysis Working!");
        console.log("   Result:", JSON.stringify(result, null, 2).substring(0, 300) + "...\n");
    } catch (error: any) {
        console.log("   ❌ FAILED:", error.message);
        console.log("   Stack:", error.stack?.substring(0, 500), "\n");
    }

    // Test 3: Settlement Draft Offer
    console.log("3️⃣  Testing Settlement Draft Offer...");
    try {
        const caseFacts = "Employment contract dispute over unpaid bonuses worth $50,000";
        const offerAmount = 35000;
        const tone: "Aggressive" | "Balanced" | "Conciliatory" = "Balanced";

        const result = await settlementService.draftOffer(caseFacts, offerAmount, tone);
        console.log("   ✅ Draft Offer Working!");
        console.log("   Draft:", result.substring(0, 200) + "...\n");
    } catch (error: any) {
        console.log("   ❌ FAILED:", error.message);
        console.log("   Stack:", error.stack?.substring(0, 500), "\n");
    }

    console.log("=" + "=".repeat(70));
}

testComplianceAndSettlement()
    .then(() => {
        console.log("\n✅ Test completed\n");
        process.exit(0);
    })
    .catch(error => {
        console.error("\n❌ Fatal error:", error);
        process.exit(1);
    });
