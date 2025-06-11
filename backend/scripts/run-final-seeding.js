// Run final seeding with error handling
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Ensure paths are correct
const dbPath = path.resolve(__dirname, '..', 'database', 'prisma', 'dev.db');
console.log(`Database path: ${dbPath}`);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

// Import the articles from the final expansion script
const finalExpansionArticles = [
  {
    title: "Pengelolaan Sampah B3 (Bahan Berbahaya dan Beracun) untuk Rumah Tangga",
    slug: "pengelolaan-sampah-b3-rumah-tangga",
    category: "Pengelolaan Plastik",
    tags: "B3,berbahaya,beracun,keamanan,rumah tangga",
    excerpt: "Panduan aman menangani dan membuang sampah B3 rumah tangga seperti baterai, cat, dan produk kimia.",
    readTime: 11,
    content: `# Pengelolaan Sampah B3 (Bahan Berbahaya dan Beracun) untuk Rumah Tangga

Sampah B3 rumah tangga memerlukan penanganan khusus untuk melindungi kesehatan keluarga dan lingkungan dari kontaminasi berbahaya.

## Identifikasi Sampah B3 Rumah Tangga

### Kategori Utama B3:

**1. Produk Elektronik:**
- Baterai (alkaline, lithium, NiMH)
- Lampu neon dan CFL
- Komponen elektronik
- Toner printer dan cartridge

**2. Produk Kimia Rumah Tangga:**
- Cat dan pelarut
- Pestisida dan insektisida
- Pembersih toilet dan drain
- Polish furniture

**3. Produk Perawatan:**
- Obat-obatan kadaluarsa
- Thermometer merkuri
- Produk perawatan kuku
- Hair spray dan aerosol

## Prinsip Pengelolaan B3

### Hirarki Pengelolaan:

**1. Pencegahan:**
- Pilih produk ramah lingkungan
- Beli sesuai kebutuhan
- Gunakan alternatif alami
- Baca label dengan teliti

**2. Penggunaan Optimal:**
- Habiskan produk sebelum beli baru
- Simpan dengan proper
- Gunakan sesuai petunjuk
- Jangan mencampur produk kimia

**3. Pembuangan Aman:**
- Pisahkan dari sampah biasa
- Gunakan kemasan asli
- Label dengan jelas
- Bawa ke tempat khusus

## Sistem Penyimpanan Sementara

### Setup Area Penyimpanan:

**Lokasi Ideal:**
- Tempat sejuk dan kering
- Jauh dari jangkauan anak
- Ventilasi yang baik
- Mudah diakses untuk pengangkutan

**Container System:**
- Box plastik berlabel
- Sekat untuk berbagai jenis
- Alas tahan bocor
- Tutup rapat dan aman

**Labeling System:**
- Jenis B3 dan tanggal
- Bahaya yang ada
- Petunjuk penanganan
- Kontak darurat

## Metode Pembuangan Aman

### Channel Resmi:

**1. Program Pemerintah:**
- Bank sampah B3
- Mobil pengumpul khusus
- Drop-off point
- Event khusus B3

**2. Kerjasama Industri:**
- Take-back program produsen
- Dealer dan distributor
- Service center
- Apotek untuk obat

**3. Fasilitas Khusus:**
- Incinerator B3
- Landfill aman
- Treatment plant
- Export ke negara maju

### Prosedur Standard:

**Preparation:**
- Sortir berdasarkan jenis
- Kemas dalam container asli
- Buat inventory list
- Siapkan transportasi aman

**Transportation:**
- Gunakan kendaraan tertutup
- Hindari guncangan berlebihan
- Bawa dokumen lengkap
- Siapkan spill kit

## Case Studies Implementasi

### Keluarga Urban Jakarta:

**Situasi:** Keluarga 4 orang dengan berbagai produk B3
**Solusi:** 
- Setup storage area di garasi
- Weekly collection routine  
- Partnership dengan bank sampah
- Monthly disposal ke facility

**Hasil:**
- 95% B3 terkelola dengan aman
- Pengurangan risiko kesehatan
- Compliance dengan regulasi
- Cost saving dari optimasi pembelian

### Komunitas Perumahan Surabaya:

**Situasi:** 200 rumah dengan masalah B3 kolektif
**Solusi:**
- Bulk collection system
- Shared storage facility
- Professional disposal service
- Education program

**Hasil:**
- 80% partisipasi warga
- Cost sharing lebih efisien
- Regular disposal schedule
- Zero incident selama 2 tahun

## Teknologi dan Inovasi

### Digital Solutions:

**1. B3 Tracking App:**
- Inventory management
- Disposal reminder
- Nearby facility locator
- Emergency contact

**2. Smart Storage:**
- IoT sensors untuk monitoring
- Temperature dan humidity control
- Leak detection system
- Automated alerts

**3. Blockchain Tracking:**
- Chain of custody
- Compliance verification
- Impact measurement
- Reward system

### Future Innovations:

**Home Treatment:**
- Compact neutralization units
- UV sterilization system
- Chemical breakdown technology
- Safe disposal pods

**Collection Optimization:**
- Route optimization AI
- Demand prediction
- Dynamic pricing
- Real-time tracking

## Regulasi dan Compliance

### Framework Hukum:

**National Level:**
- UU Pengelolaan Sampah
- PP Pengelolaan B3
- Standar SNI
- Sanksi dan penalty

**Local Regulations:**
- Perda daerah
- SOP pembuangan
- Izin dan permits
- Monitoring system

### Compliance Checklist:

**Household Level:**
- ✓ Proper identification
- ✓ Safe storage
- ✓ Authorized disposal
- ✓ Documentation

**Community Level:**
- ✓ Collective agreement
- ✓ Licensed transporter
- ✓ Approved facility
- ✓ Regular reporting

## Economic Impact

### Cost Analysis:

**Direct Costs:**
- Storage containers: Rp 200,000
- Transportation: Rp 50,000/trip
- Disposal fee: Rp 100,000/kg
- Insurance: Rp 300,000/year

**Hidden Savings:**
- Health cost prevention: Rp 2,000,000/year
- Environmental restoration avoided: Rp 5,000,000
- Legal compliance: Priceless
- Peace of mind: Invaluable

### Business Opportunities:

**Service Providers:**
- B3 collection service
- Storage solution rental
- Consultation service
- Technology development

**Market Size:**
- 50 million households
- Rp 500 billion market potential
- 20% annual growth
- Export opportunities

## Implementation Roadmap

### Phase 1 (Month 1-2): Setup
- Assess current B3 inventory
- Setup storage system
- Identify disposal channels
- Create standard procedures

### Phase 2 (Month 3-4): Optimization
- Implement tracking system
- Establish routine schedule
- Build community partnerships
- Monitor and adjust

### Phase 3 (Month 5-6): Scaling
- Expand to neighbors
- Integrate technology
- Measure environmental impact
- Share best practices

### Long-term Vision:
- Zero B3 waste to landfill
- 100% safe disposal
- Community self-sufficiency
- Technology integration

## Kesimpulan

Pengelolaan sampah B3 rumah tangga memerlukan pendekatan sistematis yang mengutamakan keamanan, compliance, dan efisiensi. Dengan implementasi yang tepat, setiap rumah tangga dapat berkontribusi pada lingkungan yang lebih aman sambil mematuhi regulasi yang berlaku.

**Key Success Factors:**
- Education dan awareness
- Proper infrastructure
- Community collaboration
- Technology adoption
- Government support

Investasi dalam sistem pengelolaan B3 yang baik tidak hanya melindungi keluarga dan lingkungan, tetapi juga menciptakan value ekonomi jangka panjang.`
  },
  {
    title: "Sistem Tracking Blockchain untuk Supply Chain Daur Ulang",
    slug: "blockchain-tracking-supply-chain-daur-ulang",
    category: "Teknologi",
    tags: "blockchain,tracking,supply chain,daur ulang,teknologi",
    excerpt: "Implementasi teknologi blockchain untuk transparansi dan akuntabilitas dalam rantai pasok industri daur ulang.",
    readTime: 13,
    content: `# Sistem Tracking Blockchain untuk Supply Chain Daur Ulang

Teknologi blockchain menghadirkan solusi revolusioner untuk transparansi dan akuntabilitas dalam supply chain industri daur ulang, memungkinkan tracking end-to-end yang dapat dipercaya.

## Fundamentals Blockchain dalam Waste Management

### Konsep Dasar:

**Distributed Ledger:**
- Record immutable untuk setiap transaksi
- Consensus mechanism untuk validasi
- Cryptographic security
- Decentralized verification

**Smart Contracts:**
- Automated execution
- Conditional payments
- Quality standards enforcement
- Compliance monitoring

**Token Economy:**
- Incentive mechanism
- Value creation
- Stakeholder participation
- Circular economy support

### Key Benefits:

**Transparency:**
- Real-time visibility
- Complete traceability
- Auditable transactions
- Public verification

**Trust:**
- Immutable records
- Verified participants
- Cryptographic proof
- Consensus validation

**Efficiency:**
- Automated processes
- Reduced intermediaries
- Fast settlement
- Cost optimization

## Architecture Design

### System Components:

**1. Data Layer:**
- Waste origin tracking
- Material composition
- Processing history
- Quality metrics
- Environmental impact

**2. Blockchain Layer:**
- Transaction recording
- Smart contract execution
- Consensus mechanism
- Network governance

**3. Application Layer:**
- User interfaces
- API services
- Analytics dashboard
- Reporting tools

**4. Integration Layer:**
- IoT sensors
- ERP systems
- Payment gateways
- Regulatory platforms

### Network Topology:

**Permissioned Blockchain:**
- Verified participants only
- Regulatory compliance
- Performance optimization
- Governance control

**Node Distribution:**
- Waste generators
- Collection services
- Processing facilities
- Manufacturers
- Regulators

## Implementation Framework

### Phase 1: Pilot Setup

**Stakeholder Onboarding:**
- Identity verification
- Digital wallet creation
- Node deployment
- Training program

**Initial Scope:**
- Single material type (PET bottles)
- Limited geographic area
- 5-10 key participants
- Basic tracking features

**Technology Stack:**
- Hyperledger Fabric
- IPFS for document storage
- Node.js backend
- React frontend
- IoT integration

### Phase 2: Feature Expansion

**Advanced Tracking:**
- Multi-material support
- Quality measurements
- Environmental metrics
- Carbon footprint

**Smart Contracts:**
- Payment automation
- Quality assurance
- Compliance checking
- Incentive distribution

**Analytics:**
- Performance dashboards
- Predictive analytics
- Impact measurement
- Optimization recommendations

### Phase 3: Ecosystem Integration

**Cross-Platform:**
- Multiple blockchain networks
- Legacy system integration
- Standard protocols
- Interoperability

**Regulatory:**
- Government platforms
- Compliance automation
- Reporting integration
- Audit trails

## Technical Implementation

### Smart Contract Architecture:

\`\`\`solidity
pragma solidity ^0.8.0;

contract WasteTracking {
    struct WasteBatch {
        string batchId;
        string materialType;
        uint256 weight;
        address origin;
        address currentOwner;
        uint256 timestamp;
        string location;
        string qualityGrade;
        bool processed;
    }
    
    mapping(string => WasteBatch) public wasteBatches;
    mapping(address => bool) public authorizedParties;
    
    event WasteCreated(string batchId, address origin);
    event WasteTransferred(string batchId, address from, address to);
    event WasteProcessed(string batchId, string result);
    
    function createWasteBatch(
        string memory _batchId,
        string memory _materialType,
        uint256 _weight,
        string memory _location,
        string memory _qualityGrade
    ) public {
        require(authorizedParties[msg.sender], "Unauthorized");
        
        wasteBatches[_batchId] = WasteBatch({
            batchId: _batchId,
            materialType: _materialType,
            weight: _weight,
            origin: msg.sender,
            currentOwner: msg.sender,
            timestamp: block.timestamp,
            location: _location,
            qualityGrade: _qualityGrade,
            processed: false
        });
        
        emit WasteCreated(_batchId, msg.sender);
    }
    
    function transferWaste(
        string memory _batchId,
        address _newOwner
    ) public {
        require(wasteBatches[_batchId].currentOwner == msg.sender, "Not owner");
        require(authorizedParties[_newOwner], "Unauthorized recipient");
        
        address previousOwner = wasteBatches[_batchId].currentOwner;
        wasteBatches[_batchId].currentOwner = _newOwner;
        
        emit WasteTransferred(_batchId, previousOwner, _newOwner);
    }
}
\`\`\`

### IoT Integration:

**Sensor Data:**
- Weight sensors
- GPS tracking
- Temperature monitoring
- Contamination detection

**Data Pipeline:**
- Real-time collection
- Edge processing
- Blockchain recording
- Alert generation

### API Services:

\`\`\`javascript
// Express.js API endpoint
app.post('/api/waste/create', async (req, res) => {
  try {
    const { batchId, materialType, weight, location, qualityGrade } = req.body;
    
    // Validate input
    const validation = validateWasteData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors });
    }
    
    // Create blockchain transaction
    const tx = await wasteContract.createWasteBatch(
      batchId,
      materialType,
      weight,
      location,
      qualityGrade
    );
    
    // Store metadata in IPFS
    const ipfsHash = await storeMetadata({
      images: req.body.images,
      certificates: req.body.certificates,
      additionalData: req.body.additionalData
    });
    
    // Update local database
    await WasteBatch.create({
      batchId,
      transactionHash: tx.hash,
      ipfsHash,
      status: 'created'
    });
    
    res.json({
      success: true,
      batchId,
      transactionHash: tx.hash,
      ipfsHash
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
\`\`\`

## Use Cases dan Implementation

### Case Study 1: PET Bottle Recycling

**Stakeholders:**
- Waste banks (collection)
- Sorting facilities
- Recycling plants
- Beverage companies
- Consumers

**Process Flow:**
1. Consumer deposits bottles at waste bank
2. Smart scale records weight and QR scan
3. Blockchain records creation with GPS location
4. Transportation to sorting facility logged
5. Quality assessment and grading recorded
6. Processing into pellets documented
7. Sale to manufacturer with certificate
8. New product creation traceable to origin

**Technology Components:**
- QR codes on bottles
- Smart weighing scales
- GPS tracking devices
- Quality assessment cameras
- RFID tags for batches

### Case Study 2: E-Waste Management

**Complex Chain:**
- Households → Collection centers → Dismantling → Component recovery → Manufacturing

**Tracking Points:**
- Device registration and lifecycle
- Collection and transportation
- Dismantling process and components
- Material recovery and purity
- New product integration

**Compliance Features:**
- Regulatory reporting automation
- Certificate of destruction
- Environmental impact calculation
- Data security verification

## Economic Model

### Token Economics:

**WasteCoin (WST) Token:**
- ERC-20 standard
- Proof of recycling rewards
- Staking for network participation
- Governance voting rights

**Reward Mechanism:**
- Collection: 1 WST per kg
- Sorting: 0.5 WST per kg processed
- Quality bonus: 25% premium
- Environmental impact: Carbon credit conversion

**Business Model:**
- Transaction fees (0.1%)
- Premium analytics (subscription)
- Compliance services
- Technology licensing

### ROI Analysis:

**Implementation Costs:**
- Blockchain development: $500,000
- IoT infrastructure: $200,000
- Training and onboarding: $100,000
- Annual operations: $150,000

**Value Creation:**
- Efficiency gains: 30% cost reduction
- Compliance automation: $100,000 savings
- Market access: 25% revenue increase
- Brand value: Premium pricing

**Payback Period:** 18-24 months

## Challenges dan Solutions

### Technical Challenges:

**Scalability:**
- Problem: High transaction volume
- Solution: Layer 2 solutions, off-chain processing

**Energy Consumption:**
- Problem: Environmental impact
- Solution: Proof of Stake consensus, green hosting

**Data Privacy:**
- Problem: Commercial sensitivity
- Solution: Zero-knowledge proofs, selective disclosure

### Business Challenges:

**Adoption Resistance:**
- Problem: Change management
- Solution: Incentive alignment, gradual migration

**Regulatory Uncertainty:**
- Problem: Compliance requirements
- Solution: Regulatory sandbox, standard development

**Cost Justification:**
- Problem: Initial investment
- Solution: Phased implementation, shared infrastructure

## Future Developments

### Technology Roadmap:

**2025-2026:**
- Cross-chain interoperability
- AI-powered quality assessment
- Automated carbon accounting
- Mobile-first interfaces

**2027-2028:**
- Global standard adoption
- Regulatory integration
- Consumer applications
- Circular economy tokens

**2029-2030:**
- Autonomous waste management
- Predictive supply chain
- Global circular marketplace
- Impact measurement standards

### Emerging Trends:

**DeFi Integration:**
- Waste-backed securities
- Circular economy lending
- Carbon credit derivatives
- Impact investing

**NFT Applications:**
- Recycled product certificates
- Environmental impact badges
- Circular design rights
- Sustainability achievements

## Implementation Guidelines

### Getting Started:

**1. Stakeholder Analysis:**
- Map current supply chain
- Identify key players
- Assess technology readiness
- Define value propositions

**2. Pilot Design:**
- Select limited scope
- Define success metrics
- Set up governance
- Plan scaling strategy

**3. Technology Setup:**
- Choose blockchain platform
- Deploy smart contracts
- Integrate IoT systems
- Build user interfaces

**4. Go-Live Strategy:**
- User training programs
- Incentive mechanisms
- Monitoring systems
- Continuous improvement

### Best Practices:

**Governance:**
- Clear decision-making processes
- Stakeholder representation
- Regular review cycles
- Conflict resolution mechanisms

**Security:**
- Multi-signature wallets
- Regular security audits
- Incident response plans
- Data backup strategies

**User Experience:**
- Intuitive interfaces
- Mobile optimization
- Real-time feedback
- Comprehensive training

## Kesimpulan

Sistem tracking blockchain untuk supply chain daur ulang menawarkan transformasi fundamental dalam transparansi, efisiensi, dan akuntabilitas. Implementasi yang sukses memerlukan pendekatan holistik yang mencakup teknologi, bisnis model, dan ekosistem stakeholder.

**Key Success Factors:**
- Strong stakeholder alignment
- Phased implementation approach
- Robust technology architecture
- Clear value propositions
- Regulatory compliance
- Continuous innovation

Dengan investasi yang tepat dan eksekusi yang baik, blockchain dapat menjadi backbone untuk circular economy yang truly transparent dan accountable, menciptakan value tidak hanya untuk bisnis tetapi juga untuk lingkungan dan masyarakat.`
  }
];

async function seedFinalExpansion() {
  try {
    console.log('🚀 Starting final expansion seeding...');
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const article of finalExpansionArticles) {
      try {
        // Check if article already exists
        const existing = await prisma.article.findUnique({
          where: { slug: article.slug }
        });
        
        if (existing) {
          console.log(`⚠️  Skipping existing article: ${article.title}`);
          skipCount++;
          continue;
        }
        
        // Create new article
        await prisma.article.create({
          data: {
            ...article,
            viewCount: Math.floor(Math.random() * 100) + 50,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
            updatedAt: new Date()
          }
        });
        
        console.log(`✅ Created: ${article.title}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to create ${article.title}:`, error.message);
      }
    }
    
    console.log(`\n📊 Final Expansion Summary:`);
    console.log(`   ✅ Created: ${successCount} articles`);
    console.log(`   ⚠️  Skipped: ${skipCount} articles`);
    
    // Get final count
    const totalCount = await prisma.article.count();
    console.log(`\n🎯 Total articles in database: ${totalCount}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFinalExpansion();
