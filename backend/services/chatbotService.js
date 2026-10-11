const { NlpManager } = require('node-nlp');
const Inventory = require('../models/Inventory');
const Room = require('../models/Room');
const User = require('../models/User');
const Maintenance = require('../models/Maintenance');

class ChatbotService {
  constructor() {
    this.manager = new NlpManager({
      languages: ['en'],
      forceNER: true,
      nlu: { log: false }
    });
    this.isTrained = false;
    this.trainingPromise = null;
  }

  async init() {
    if (this.isTrained) return;
    if (this.trainingPromise) return this.trainingPromise;

    this.trainingPromise = (async () => {
      console.log('🤖 Training Hostel Assistant Engine...');
      this.registerDocuments();
      await this.manager.train();
      this.isTrained = true;
      console.log('✅ Hostel Assistant Engine trained & ready!');
    })();

    return this.trainingPromise;
  }

  registerDocuments() {
    const m = this.manager;

    // --- 1. CASUAL GREETINGS & SMALL TALK ---
    const greetings = [
      'hi', 'hii', 'hiii', 'hiiii', 'hello', 'helloo', 'heyy', 'hey', 'heya',
      'good morning', 'good afternoon', 'good evening', 'good day', 'morning',
      'greetings', 'namaste', 'hola', 'yo', 'sup', 'wassup', 'anyone there', 'test'
    ];
    greetings.forEach(text => m.addDocument('en', text, 'greeting.hello'));

    const botIdentity = [
      'who are you', 'what are you', 'what is your name', 'tell me about yourself',
      'what can you do', 'how can you help me', 'what is this bot', 'help me',
      'introduce yourself', 'your capabilities'
    ];
    botIdentity.forEach(text => m.addDocument('en', text, 'bot.identity'));

    const howAreYou = [
      'how are you', 'how are you doing', 'how is it going', 'are you okay', 'how do you do',
      'what is going on', 'how is your day', 'whats up'
    ];
    howAreYou.forEach(text => m.addDocument('en', text, 'bot.how_are_you'));

    const thanks = [
      'thank you', 'thanks', 'thanks a lot', 'thank you so much', 'appreciate it',
      'great help', 'awesome thanks', 'thanks buddy', 'thx', 'thank u', 'ty'
    ];
    thanks.forEach(text => m.addDocument('en', text, 'greeting.thanks'));

    const bye = [
      'bye', 'goodbye', 'see you', 'see you later', 'take care', 'cya', 'exit', 'good night', 'gn'
    ];
    bye.forEach(text => m.addDocument('en', text, 'greeting.bye'));

    const compliments = [
      'you are great', 'good bot', 'you are awesome', 'cool', 'nice work', 'well done', 'smart bot'
    ];
    compliments.forEach(text => m.addDocument('en', text, 'bot.compliment'));

    // --- 2. GENERAL STUDENT CONVERSATION & LIFE ---
    const boredom = [
      'i am bored', 'what to do', 'entertain me', 'tell me a joke', 'hostel life is boring'
    ];
    boredom.forEach(text => m.addDocument('en', text, 'general.joke'));

    const study = [
      'where can i study quietly', 'exam preparation', 'study area', 'quiet place to read', 'library'
    ];
    study.forEach(text => m.addDocument('en', text, 'hostel.study'));

    const weather = [
      'is it hot today', 'is it cold', 'weather', 'raining outside'
    ];
    weather.forEach(text => m.addDocument('en', text, 'general.weather'));

    // --- 3. MESS & FOOD ---
    const messTimings = [
      'what are mess timings', 'when is breakfast', 'when is lunch', 'dinner timing',
      'mess schedule', 'mess hours', 'food timings', 'when can i eat', 'mess open time',
      'breakfast hours', 'lunch hours', 'dinner schedule', 'when does mess close'
    ];
    messTimings.forEach(text => m.addDocument('en', text, 'mess.timings'));

    const messMenu = [
      'what is mess menu', 'what food is served', 'today menu', 'mess diet',
      'is there non veg', 'vegetarian food in mess', 'mess food quality', 'weekly menu', 'food list'
    ];
    messMenu.forEach(text => m.addDocument('en', text, 'mess.menu'));

    const messRules = [
      'can i take food to room', 'is outside food allowed in hostel', 'mess rules',
      'swiggy zomato allowed', 'mess rebate policy', 'leave mess fee deduction'
    ];
    messRules.forEach(text => m.addDocument('en', text, 'mess.rules'));

    // --- 4. TIMINGS, GATES & CURFEW ---
    const curfew = [
      'what is hostel gate closing time', 'curfew time', 'in time of hostel',
      'when does gate close', 'hostel entry deadline', 'latest time to enter hostel',
      'late entry rules', 'what happens if late', 'gate hours'
    ];
    curfew.forEach(text => m.addDocument('en', text, 'hostel.curfew'));

    const nightPass = [
      'how to get night pass', 'night out permission', 'can i stay outside overnight',
      'leave application process', 'hostel out pass', 'how to apply for leave',
      'permission for going home', 'weekend leave rules'
    ];
    nightPass.forEach(text => m.addDocument('en', text, 'hostel.night_pass'));

    // --- 5. VISITORS & GUESTS ---
    const visitors = [
      'are visitors allowed', 'can parents stay in hostel', 'can friends visit my room',
      'guest entry rules', 'guest room booking', 'visiting hours', 'visitor policy',
      'can outsiders come into hostel'
    ];
    visitors.forEach(text => m.addDocument('en', text, 'hostel.visitors'));

    // --- 6. WI-FI & INTERNET ---
    const wifi = [
      'what is wifi password', 'how to connect to hostel wifi', 'wifi not working',
      'internet access', 'hostel network speed', 'lan port available', 'wifi login portal'
    ];
    wifi.forEach(text => m.addDocument('en', text, 'hostel.wifi'));

    // --- 7. FACILITIES & AMENITIES ---
    const laundry = [
      'where is laundry', 'washing machine rules', 'how to wash clothes',
      'ironing facilities', 'dry cleaner in hostel', 'laundry timings'
    ];
    laundry.forEach(text => m.addDocument('en', text, 'hostel.laundry'));

    const gymSports = [
      'is there a gym', 'gym timings', 'sports equipment', 'badminton court',
      'table tennis in hostel', 'cricket ground', 'recreation room'
    ];
    gymSports.forEach(text => m.addDocument('en', text, 'hostel.gym_sports'));

    const generalFacilities = [
      'what facilities are available', 'is there study room', 'library timing',
      'drinking water cooler', 'geyser hot water timings', 'power backup generator',
      'vending machine', 'common room'
    ];
    generalFacilities.forEach(text => m.addDocument('en', text, 'hostel.facilities'));

    // --- 8. HEALTH & EMERGENCY ---
    const emergency = [
      'medical emergency', 'first aid box location', 'is doctor available in hostel',
      'ambulance number', 'sick room in hostel', 'warden emergency contact',
      'hospital nearby', 'i am feeling sick'
    ];
    emergency.forEach(text => m.addDocument('en', text, 'hostel.emergency'));

    // --- 9. RULES & DISCIPLINE ---
    const rules = [
      'what are hostel rules', 'anti ragging policy', 'is smoking allowed',
      'alcohol banned', 'drinking rules in hostel', 'noise rules after 10 pm',
      'room inspection rules', 'prohibited items in hostel', 'electric kettle allowed'
    ];
    rules.forEach(text => m.addDocument('en', text, 'hostel.rules'));

    // --- 10. WARDEN & CONTACTS ---
    const warden = [
      'who is the warden', 'how to contact warden', 'warden office location',
      'warden email phone', 'chief warden name', 'caretaker contact',
      'hostel office timings'
    ];
    warden.forEach(text => m.addDocument('en', text, 'hostel.warden'));

    // --- 11. FEES & REFUNDS ---
    const fees = [
      'hostel fee structure', 'how to pay hostel fees', 'when is fee due',
      'security deposit refund', 'caution money refund', 'fee receipt'
    ];
    fees.forEach(text => m.addDocument('en', text, 'hostel.fees'));

    // --- 12. DYNAMIC DATABASE INTENTS ---
    const invItem = [
      'check stock of item', 'how much stock is left', 'check inventory for',
      'is there any item available', 'quantity of item', 'find item in inventory',
      'do we have stock of', 'show me stock of'
    ];
    invItem.forEach(text => m.addDocument('en', text, 'inventory.check_item'));

    const lowStock = [
      'what items are low on stock', 'which items need reorder', 'low stock alerts',
      'items running out of stock', 'critical inventory items', 'shortage of supplies',
      'what do we need to buy', 'restock list', 'items below limit'
    ];
    lowStock.forEach(text => m.addDocument('en', text, 'inventory.low_stock'));

    const invTotal = [
      'total inventory items', 'how many items in inventory', 'list all inventory items',
      'overview of inventory', 'inventory summary', 'total items in stock'
    ];
    invTotal.forEach(text => m.addDocument('en', text, 'inventory.total'));

    const damagedInv = [
      'any damaged items in inventory', 'broken inventory items', 'items needing repair',
      'damaged goods report', 'damaged items count'
    ];
    damagedInv.forEach(text => m.addDocument('en', text, 'inventory.damaged'));

    const vacantRooms = [
      'how many rooms are available', 'how many vacant rooms', 'are there empty rooms',
      'check available rooms', 'free rooms in hostel', 'vacant beds count',
      'available beds', 'is there any vacant room', 'room vacancy'
    ];
    vacantRooms.forEach(text => m.addDocument('en', text, 'room.vacant'));

    const roomDetails = [
      'details of room', 'who is in room', 'check room number',
      'status of room', 'capacity of room', 'is room empty or full',
      'show me room info'
    ];
    roomDetails.forEach(text => m.addDocument('en', text, 'room.details'));

    const totalRooms = [
      'how many total rooms in hostel', 'total room count', 'hostel room capacity',
      'how many blocks and floors', 'room statistics'
    ];
    totalRooms.forEach(text => m.addDocument('en', text, 'room.total'));

    const studentCount = [
      'how many students are in hostel', 'total student count', 'hostel strength',
      'number of hostellers', 'total registered students'
    ];
    studentCount.forEach(text => m.addDocument('en', text, 'student.count'));

    const studentSearch = [
      'find student', 'search student', 'which room is student staying in',
      'locate student', 'student room allotment info'
    ];
    studentSearch.forEach(text => m.addDocument('en', text, 'student.search'));

    const maintPending = [
      'any pending maintenance issues', 'pending maintenance requests',
      'unresolved maintenance tickets', 'how many complaints are open',
      'list maintenance problems', 'active repair works'
    ];
    maintPending.forEach(text => m.addDocument('en', text, 'maintenance.pending'));

    const maintUrgent = [
      'urgent maintenance issues', 'critical repair requests',
      'high priority complaints', 'emergency maintenance'
    ];
    maintUrgent.forEach(text => m.addDocument('en', text, 'maintenance.urgent'));

    const maintReport = [
      'how do i report a complaint', 'how to raise maintenance request',
      'my room light fan broken what to do', 'plumbing repair complaint process',
      'how to submit repair request'
    ];
    maintReport.forEach(text => m.addDocument('en', text, 'maintenance.how_to_report'));
  }

  extractRoomNumber(message) {
    const match = message.match(/(?:room\s*(?:no\.?|number)?\s*|#)?([A-Za-z]?\s*[-]?\s*\d{2,4}[A-Za-z]?)/i);
    if (match && match[1]) {
      return match[1].replace(/\s+/g, '').toUpperCase();
    }
    return null;
  }

  // Smart keyword classifier to catch variations and conversational queries
  smartKeywordMatcher(cleanMsg) {
    const normalized = cleanMsg.toLowerCase().trim();

    // 1. Natural greetings & casual conversation
    if (/^(hi+|hey+|hello+|heya+|hola+|yo+|sup|wassup|namaste|morning|afternoon|evening|greetings|gm|ge)[!.,\s]*$/i.test(normalized)) {
      return 'greeting.hello';
    }
    if (/^(how are you|how r u|how do you do|how is it going|hows it going|whats up|what's up|how are things)[?!\s]*$/i.test(normalized)) {
      return 'bot.how_are_you';
    }
    if (/^(who are you|who r u|what are you|what is your name|your name|what can you do|help me)[?!\s]*$/i.test(normalized)) {
      return 'bot.identity';
    }
    if (/^(thank(s)?|thank you|thx|ty|thanks a lot|appreciate it)[!.,\s]*$/i.test(normalized)) {
      return 'greeting.thanks';
    }
    if (/^(bye+|goodbye|cya|see you|good night|gn)[!.,\s]*$/i.test(normalized)) {
      return 'greeting.bye';
    }
    if (/great|awesome|cool|nice|good job|smart/i.test(normalized) && normalized.length < 25) {
      return 'bot.compliment';
    }
    if (/joke|bored|entertain/i.test(normalized)) {
      return 'general.joke';
    }
    if (/study|library|reading room/i.test(normalized)) {
      return 'hostel.study';
    }

    // 2. Hostel Domains
    if (/mess|food|breakfast|lunch|dinner|meal|diet|snack/i.test(normalized)) {
      if (/menu|items|dish|today/i.test(normalized)) return 'mess.menu';
      if (/rule|outside|swiggy|zomato/i.test(normalized)) return 'mess.rules';
      return 'mess.timings';
    }
    if (/gate|curfew|in[- ]?time|entry|lock|closing time/i.test(normalized)) {
      return 'hostel.curfew';
    }
    if (/night[- ]?out|night pass|out[- ]?pass|leave|permission|vacation|holiday/i.test(normalized)) {
      return 'hostel.night_pass';
    }
    if (/guest|visitor|parent|friend|relative/i.test(normalized)) {
      return 'hostel.visitors';
    }
    if (/wifi|wi-fi|internet|lan|network/i.test(normalized)) {
      return 'hostel.wifi';
    }
    if (/wash|laundry|cloth|iron|dry clean/i.test(normalized)) {
      return 'hostel.laundry';
    }
    if (/gym|sports|table tennis|badminton|cricket|workout/i.test(normalized)) {
      return 'hostel.gym_sports';
    }
    if (/doctor|sick|ill|medicine|medical|ambulance|fever|first aid/i.test(normalized)) {
      return 'hostel.emergency';
    }
    if (/warden|caretaker|contact|office|in-charge/i.test(normalized)) {
      return 'hostel.warden';
    }
    if (/fee|charge|deposit|caution|refund|payment/i.test(normalized)) {
      return 'hostel.fees';
    }
    if (/rule|discipline|smoke|alcohol|drink|ragging|noise|prohibited/i.test(normalized)) {
      return 'hostel.rules';
    }
    if (/facility|amenit|geyser|hot water|purifier|generator|library|study/i.test(normalized)) {
      return 'hostel.facilities';
    }
    if (/broken|leak|plumb|fan|light|switch|tap|flush|repair|maintenance|complaint/i.test(normalized)) {
      if (/how|process|file|raise|lodge|submit/i.test(normalized)) return 'maintenance.how_to_report';
      if (/urgent|critical|emergency|high/i.test(normalized)) return 'maintenance.urgent';
      return 'maintenance.pending';
    }
    if (/room/i.test(normalized)) {
      if (/\d{2,4}/.test(normalized)) return 'room.details';
      if (/vacan|avail|free|empty/i.test(normalized)) return 'room.vacant';
      return 'room.total';
    }
    if (/stock|inventory|item|supply|supplies|material/i.test(normalized)) {
      if (/low|short|restock|reorder|out of/i.test(normalized)) return 'inventory.low_stock';
      if (/damage|broken/i.test(normalized)) return 'inventory.damaged';
      return 'inventory.total';
    }
    if (/student|hosteller|occupant|boy|girl/i.test(normalized)) {
      return 'student.count';
    }
    return null;
  }

  async processMessage(userMessage) {
    await this.init();

    if (!userMessage || !userMessage.trim()) {
      return {
        reply: "Hi there! I am your Hostel Assistant. You can ask me about room vacancies, inventory stock, mess timings, curfew, or maintenance status.",
        intent: 'greeting.hello'
      };
    }

    const cleanMsg = userMessage.trim();

    // 1. Fast exact/regex check first for casual conversations & greetings
    const fastIntent = this.smartKeywordMatcher(cleanMsg);

    // 2. Run NLP processor
    const result = await this.manager.process('en', cleanMsg);
    let intent = fastIntent || result.intent;

    if (!intent || intent === 'None' || (!fastIntent && result.score < 0.65)) {
      const fallback = this.smartKeywordMatcher(cleanMsg);
      if (fallback) intent = fallback;
    }

    // 3. Dispatch intent
    switch (intent) {
      // --- DYNAMIC INVENTORY ---
      case 'inventory.low_stock':
        return await this.handleLowStock();

      case 'inventory.total':
        return await this.handleTotalInventory();

      case 'inventory.damaged':
        return await this.handleDamagedInventory();

      case 'inventory.check_item':
        return await this.handleCheckItem(cleanMsg);

      // --- DYNAMIC ROOMS ---
      case 'room.vacant':
        return await this.handleVacantRooms();

      case 'room.details':
        return await this.handleRoomDetails(cleanMsg);

      case 'room.total':
        return await this.handleTotalRooms();

      // --- DYNAMIC STUDENTS ---
      case 'student.count':
        return await this.handleStudentCount();

      case 'student.search':
        return await this.handleStudentSearch(cleanMsg);

      // --- DYNAMIC MAINTENANCE ---
      case 'maintenance.pending':
        return await this.handlePendingMaintenance();

      case 'maintenance.urgent':
        return await this.handleUrgentMaintenance();

      case 'maintenance.how_to_report':
        return {
          reply: `🛠️ **How to Raise a Maintenance Request:**\n\n1. Go to the **Maintenance** tab in the sidebar (or your Student Portal).\n2. Click on **"+ Report Issue"**.\n3. Select your Room Number and Category (Electrical, Plumbing, Furniture, or Appliances).\n4. Specify the priority (Low, Medium, High, or Critical) and provide a description.\n5. Click **Submit**! The hostel caretaker will be notified immediately.`,
          intent
        };

      // --- CASUAL & GENERAL CONVERSATION ---
      case 'greeting.hello':
        return {
          reply: `👋 Hello there! How are you doing today?\n\nI'm your **Hostel Assistant**. Feel free to ask me anything about:\n• 🛏️ **Room availability & allotments**\n• 📦 **Inventory & supplies stock**\n• 🍽️ **Mess timings & menus**\n• ⏰ **Hostel gates & curfew**\n• 🛠️ **Maintenance & repair requests**\n\nWhat would you like to check?`,
          intent
        };

      case 'bot.identity':
        return {
          reply: `🤖 I am the **Hostel Assistant** for this portal!\n\nI can look up live room bookings, inventory items, pending maintenance complaints, mess meal hours, Wi-Fi credentials, and all hostel safety regulations. Ask away!`,
          intent
        };

      case 'bot.how_are_you':
        return {
          reply: `😊 I'm doing great, thank you for asking! Ready to help you with any hostel queries or room lookups. How is everything with you?`,
          intent
        };

      case 'bot.compliment':
        return {
          reply: `✨ Thank you so much! Always happy to help make hostel life easier and smoother. Let me know if you need anything else!`,
          intent
        };

      case 'greeting.thanks':
        return {
          reply: `You're very welcome! If you ever need help with room details, food schedules, or supplies, just drop a message here. Have a great day! ✨`,
          intent
        };

      case 'greeting.bye':
        return {
          reply: `Take care and have a wonderful day ahead! Reach out anytime you have a question. 👋`,
          intent
        };

      case 'general.joke':
        return {
          reply: `😄 Here's a quick hostel joke for you:\n\n*Why did the student bring a ladder to the hostel mess?*\n*Because they heard the food was on another level!* 🍜😂\n\nNeed to check the real mess timings or today's menu instead? Just ask!`,
          intent
        };

      case 'hostel.study':
        return {
          reply: `📚 **Quiet Study Areas:**\n\n• **Hostel Reading Hall:** 1st Floor Central Wing (Open 24/7 with charging points & Wi-Fi).\n• **Campus Central Library:** 8:00 AM – 11:00 PM on weekdays.\n• Corridors and common rooms observe strict silence hours after 10:30 PM.`,
          intent
        };

      case 'general.weather':
        return {
          reply: `🌤️ You can check the current campus temperature on your phone! Don't forget that chilled RO water coolers are active on every hostel floor, and geysers run hot water in the mornings and evenings.`,
          intent
        };

      // --- STATIC FAQ / HOSTEL KNOWLEDGE BASE ---
      case 'mess.timings':
        return {
          reply: `🍽️ **Hostel Mess Timings:**\n\n• **Breakfast:** 7:30 AM – 9:30 AM\n• **Lunch:** 12:30 PM – 2:30 PM\n• **Evening Snacks & Tea:** 5:00 PM – 6:15 PM\n• **Dinner:** 7:30 PM – 9:45 PM\n\n*Note: Please bring your Hostel ID/Mess Card for scanning at the counter.*`,
          intent
        };

      case 'mess.menu':
        return {
          reply: `🍲 **Mess Menu Highlights:**\n\n• **Breakfast:** Poha / Idli Sambar / Parathas / Bread Butter + Boiled Eggs / Milk / Tea.\n• **Lunch:** Rice, Roti, Dal Tadka, 2 Seasonal Sabzis, Curd, Salad, and Papad.\n• **Snacks:** Samosa / Pakoras / Biscuits with Hot Tea / Coffee.\n• **Dinner:** Jeera Rice, Paneer Butter Masala / Chicken Curry (Wed & Sun), Rotis, and Sweet/Gulab Jamun.\n\n*Special festive feasts are organized on the first Sunday of each month.*`,
          intent
        };

      case 'mess.rules':
        return {
          reply: `📜 **Mess Regulations:**\n\n1. Food is not allowed to be taken inside student rooms (except for sick students with medical permission).\n2. Outside food deliveries (Swiggy/Zomato) are permitted up to 10:00 PM and must be collected at the security gate.\n3. Mess rebate can be availed if you apply for leave at least 3 days in advance (minimum 4 consecutive days).`,
          intent
        };

      case 'hostel.curfew':
        return {
          reply: `⏰ **Hostel Gate Timings & Curfew:**\n\n• **Main Gate Closes:** **10:00 PM** sharp every night.\n• **Morning Opening:** **6:00 AM**.\n• Late entries after 10:00 PM require a physical entry in the warden register and prior written permission.\n• Habitual late entries may lead to disciplinary action and notification to guardians.`,
          intent
        };

      case 'hostel.night_pass':
        return {
          reply: `🎫 **Night Pass & Leave Application Process:**\n\n1. Submit a leave request on the Student Portal or fill the physical Leave Slip at the Warden Office.\n2. Request must be made **at least 24 hours prior** to leaving.\n3. Mention the destination address, dates, and parent/guardian contact.\n4. Once approved by the Warden, collect your gate pass from the security desk.`,
          intent
        };

      case 'hostel.visitors':
        return {
          reply: `👥 **Hostel Visitor Policy:**\n\n• Visiting hours: **9:00 AM to 7:00 PM** in the Visitor Lounge / Reception.\n• Parents are allowed in the common area and visitor lounge.\n• Non-hostel friends or external visitors are strictly prohibited from entering private student rooms.\n• Guest rooms can be booked for parents for up to 2 nights with prior warden approval.`,
          intent
        };

      case 'hostel.wifi':
        return {
          reply: `📶 **Hostel Wi-Fi Information:**\n\n• **SSID:** \`Hostel_HighSpeed_Campus\`\n• **Login:** Enter your Student Registration ID and your default portal password.\n• High-speed fiber internet is active 24/7 across all blocks.\n• For connectivity issues or MAC address binding, contact the IT Cell in Room 104 or log a ticket.`,
          intent
        };

      case 'hostel.laundry':
        return {
          reply: `🧺 **Laundry & Washing Facilities:**\n\n• Automatic washing machines are available on the Ground Floor and 2nd Floor utility rooms of each block.\n• Open hours: **6:00 AM – 10:00 PM**.\n• Drying lines and stands are set up on the hostel terrace.\n• Professional laundry/ironing pickup is available on Tuesdays and Fridays at the gate.`,
          intent
        };

      case 'hostel.gym_sports':
        return {
          reply: `🏋️ **Gym & Recreation Facilities:**\n\n• **Gym Hours:** 6:00 AM – 9:00 AM (Morning) & 5:00 PM – 9:30 PM (Evening).\n• **Indoor Games:** Table Tennis, Chess, Carrom, and Foosball are in the 1st Floor Activity Hall.\n• **Outdoor Sports:** Badminton court in the central courtyard and access to the university cricket ground.`,
          intent
        };

      case 'hostel.facilities':
        return {
          reply: `🏢 **Hostel Amenities & Facilities:**\n\n• 24/7 Electricity with 100% DG Generator backup.\n• RO Water Purifiers and Coolers on every floor.\n• Solar and electrical geysers (Hot water from 6:00 AM – 10:00 AM & 6:00 PM – 9:00 PM).\n• Quiet Study Room open 24/7 on the 1st Floor with power sockets for laptops.`,
          intent
        };

      case 'hostel.emergency':
        return {
          reply: `🚨 **Medical & Emergency Contacts:**\n\n• **Hostel Infirmary / First Aid:** Room 002 (Ground Floor).\n• **Campus Doctor Timings:** 9:00 AM – 1:00 PM & 4:00 PM – 7:00 PM.\n• **Emergency Ambulance:** +91-9876543210 / Ext: 108\n• **24/7 Security Gate Guard:** Ext: 101\n• If you feel unwell, inform your wing representative or the caretaker immediately!`,
          intent
        };

      case 'hostel.rules':
        return {
          reply: `⚖️ **Hostel Code of Conduct:**\n\n1. **Zero Tolerance on Ragging:** Ragging is a criminal offense and results in immediate expulsion and police action.\n2. **Substance Ban:** Smoking, alcohol, tobacco, and illicit substances are strictly banned.\n3. **Silence Hours:** Please maintain quiet in the corridors after 10:30 PM.\n4. **Electrical Appliances:** High-wattage heating coils and induction stoves are prohibited inside rooms for fire safety.`,
          intent
        };

      case 'hostel.warden':
        return {
          reply: `👔 **Warden & Administration Contacts:**\n\n• **Chief Warden:** Dr. R. K. Sharma (Office: Admin Block Room 101)\n• **Warden Office Hours:** 4:00 PM – 6:30 PM (Mon to Fri)\n• **Contact Number:** +91-9876500000\n• **Hostel Email:** \`warden.hostel@campus.edu\`\n• For immediate help after office hours, contact the Resident Caretaker at Ground Floor reception.`,
          intent
        };

      case 'hostel.fees':
        return {
          reply: `💳 **Hostel Fees & Payment:**\n\n• Hostel accommodation and mess fees are payable per semester via the University Online ERP portal.\n• Late fee penalty applies after the 15th of the opening semester month.\n• Caution security deposits are 100% refundable at the time of final graduation upon obtaining a No-Dues clearance.`,
          intent
        };

      default: {
        const dynamicItemResult = await this.handleCheckItem(cleanMsg);
        if (dynamicItemResult) {
          return dynamicItemResult;
        }

        return {
          reply: `👋 I'm here to help with anything around the hostel! Try asking:\n\n• *"How many vacant rooms are available?"*\n• *"What items are running low on stock?"*\n• *"What are the mess timings & menu?"*\n• *"What is the curfew time?"*\n• *"How do I raise a maintenance request?"*`,
          intent: 'fallback'
        };
      }
    }
  }

  // --- DYNAMIC DATABASE HANDLERS ---

  async handleLowStock() {
    try {
      const lowStockItems = await Inventory.find({
        $expr: { $lte: ['$quantity', '$lowStockLimit'] }
      }).limit(10);

      if (!lowStockItems || lowStockItems.length === 0) {
        return {
          reply: "✅ **All good!** All inventory items are currently well above their minimum stock thresholds.",
          intent: 'inventory.low_stock'
        };
      }

      let text = `⚠️ **Low Stock Alert (${lowStockItems.length} items need attention):**\n\n`;
      lowStockItems.forEach((item, index) => {
        text += `${index + 1}. **${item.name}** (${item.category})\n   • Current Stock: **${item.quantity} ${item.unit || 'units'}** (Threshold: ${item.lowStockLimit})\n   • Location: ${item.location}\n`;
      });
      text += `\n💡 *You can create a purchase request from the Inventory tab to restock.*`;

      return { reply: text, intent: 'inventory.low_stock' };
    } catch (err) {
      console.error('Error in handleLowStock:', err);
      return { reply: "Unable to retrieve low stock items right now. Please check the Inventory page.", intent: 'inventory.low_stock' };
    }
  }

  async handleTotalInventory() {
    try {
      const totalCount = await Inventory.countDocuments();
      const items = await Inventory.find().limit(6);
      const lowCount = await Inventory.countDocuments({
        $expr: { $lte: ['$quantity', '$lowStockLimit'] }
      });

      let text = `📦 **Inventory Summary:**\n\n• **Total Registered Items:** ${totalCount}\n• **Items Low on Stock:** ${lowCount}\n\n**Sample Items in Store:**\n`;
      items.forEach(it => {
        text += `• **${it.name}**: ${it.quantity} ${it.unit || 'units'} (${it.category})\n`;
      });

      if (totalCount > 6) {
        text += `\n...and ${totalCount - 6} more items. View complete list on the **Inventory** page.`;
      }

      return { reply: text, intent: 'inventory.total' };
    } catch (err) {
      console.error('Error in handleTotalInventory:', err);
      return { reply: "Could not fetch inventory overview. Please verify database connection.", intent: 'inventory.total' };
    }
  }

  async handleDamagedInventory() {
    try {
      const damagedItems = await Inventory.find({
        $or: [
          { damagedCount: { $gt: 0 } },
          { repairCount: { $gt: 0 } }
        ]
      });

      if (!damagedItems || damagedItems.length === 0) {
        return {
          reply: "✨ No damaged or under-repair items recorded in the inventory system.",
          intent: 'inventory.damaged'
        };
      }

      let text = `🔧 **Damaged / Under-Repair Inventory Items:**\n\n`;
      damagedItems.forEach(item => {
        text += `• **${item.name}**\n  - Damaged: ${item.damagedCount || 0} ${item.unit || 'units'}\n  - In Repair: ${item.repairCount || 0} ${item.unit || 'units'}\n  - Usable: ${item.goodCount || item.quantity} ${item.unit || 'units'}\n`;
      });

      return { reply: text, intent: 'inventory.damaged' };
    } catch (err) {
      console.error('Error in handleDamagedInventory:', err);
      return { reply: "Failed to retrieve damaged inventory records.", intent: 'inventory.damaged' };
    }
  }

  async handleCheckItem(message) {
    try {
      const allItems = await Inventory.find();
      if (!allItems || allItems.length === 0) return null;

      const lower = message.toLowerCase();
      const matched = allItems.find(it => lower.includes(it.name.toLowerCase()));

      if (!matched) {
        if (/stock of|quantity of|how much/i.test(message)) {
          return {
            reply: `I couldn't locate that specific item in the inventory registry. Available items include **${allItems.slice(0, 4).map(i => i.name).join(', ')}**, etc. Check the Inventory tab for the full list.`,
            intent: 'inventory.check_item'
          };
        }
        return null;
      }

      const isLow = matched.quantity <= matched.lowStockLimit;
      const statusIcon = isLow ? '⚠️' : '✅';

      const reply = `${statusIcon} **Item Stock: ${matched.name}**\n\n` +
        `• **Current Available Quantity:** **${matched.quantity} ${matched.unit || 'units'}**\n` +
        `• **Category:** ${matched.category}\n` +
        `• **Location:** ${matched.location || 'Central Hostel Store'}\n` +
        `• **Good Condition:** ${matched.goodCount || matched.quantity}\n` +
        `• **Damaged / In Repair:** ${matched.damagedCount || 0} / ${matched.repairCount || 0}\n` +
        `• **Stock Status:** ${isLow ? '🚨 Low Stock (Below limit ' + matched.lowStockLimit + ')' : 'Adequate'}`;

      return { reply, intent: 'inventory.check_item' };
    } catch (err) {
      console.error('Error in handleCheckItem:', err);
      return null;
    }
  }

  async handleVacantRooms() {
    try {
      const rooms = await Room.find();
      if (!rooms || rooms.length === 0) {
        return {
          reply: "ℹ️ No rooms are currently registered in the database.",
          intent: 'room.vacant'
        };
      }

      const availableRooms = rooms.filter(r => r.status === 'Available' || (r.occupiedBeds < r.capacity));
      let totalVacantBeds = 0;
      availableRooms.forEach(r => {
        totalVacantBeds += Math.max(0, r.capacity - (r.occupiedBeds || 0));
      });

      const sampleRooms = availableRooms.slice(0, 8).map(r => {
        const freeBeds = r.capacity - (r.occupiedBeds || 0);
        return `Room **${r.roomNumber}** (Block ${r.block}, ${freeBeds} bed${freeBeds > 1 ? 's' : ''} free)`;
      });

      let text = `🛏️ **Hostel Room Vacancy Status:**\n\n` +
        `• **Available Rooms with Free Beds:** **${availableRooms.length}** out of ${rooms.length} rooms\n` +
        `• **Total Vacant Beds:** **${totalVacantBeds}** beds\n\n` +
        `**Vacant Rooms List:**\n` +
        sampleRooms.map(s => `• ${s}`).join('\n');

      if (availableRooms.length > 8) {
        text += `\n...and ${availableRooms.length - 8} more available rooms.`;
      }

      return { reply: text, intent: 'room.vacant' };
    } catch (err) {
      console.error('Error in handleVacantRooms:', err);
      return { reply: "Could not fetch room vacancies. Please check the Rooms page.", intent: 'room.vacant' };
    }
  }

  async handleRoomDetails(message) {
    try {
      const roomNum = this.extractRoomNumber(message);
      if (!roomNum) {
        return await this.handleVacantRooms();
      }

      const room = await Room.findOne({
        roomNumber: { $regex: new RegExp(`^${roomNum}$`, 'i') }
      });

      if (!room) {
        return {
          reply: `🔍 Could not find **Room ${roomNum}** in the hostel records. Please double-check the room number.`,
          intent: 'room.details'
        };
      }

      const students = await User.find({
        roomNumber: { $regex: new RegExp(`^${roomNum}$`, 'i') }
      }).select('name studentId email contact');

      const freeBeds = Math.max(0, room.capacity - (room.occupiedBeds || 0));
      let text = `🏠 **Room Details: ${room.roomNumber}**\n\n` +
        `• **Block:** ${room.block} | **Floor:** ${room.floor}\n` +
        `• **Capacity:** ${room.capacity} beds\n` +
        `• **Occupied Beds:** ${room.occupiedBeds || 0} (${freeBeds} free)\n` +
        `• **Status:** **${room.status}**\n`;

      if (room.inventoryItems && room.inventoryItems.length > 0) {
        text += `• **Room Inventory Assigned:** ${room.inventoryItems.join(', ')}\n`;
      }

      if (students && students.length > 0) {
        text += `\n**Allocated Students:**\n`;
        students.forEach((s, idx) => {
          text += `${idx + 1}. **${s.name}** ${s.studentId ? `(ID: ${s.studentId})` : ''}\n`;
        });
      } else {
        text += `\n*No students currently registered to this room.*`;
      }

      return { reply: text, intent: 'room.details' };
    } catch (err) {
      console.error('Error in handleRoomDetails:', err);
      return { reply: "Error checking room details.", intent: 'room.details' };
    }
  }

  async handleTotalRooms() {
    try {
      const total = await Room.countDocuments();
      const available = await Room.countDocuments({ status: 'Available' });
      const full = await Room.countDocuments({ status: 'Full' });
      const maintenance = await Room.countDocuments({ status: 'Maintenance' });

      const reply = `🏢 **Hostel Accommodation Statistics:**\n\n` +
        `• **Total Rooms:** ${total}\n` +
        `• **Available Rooms:** ${available}\n` +
        `• **Full / Fully Occupied:** ${full}\n` +
        `• **Under Maintenance:** ${maintenance}\n\n` +
        `You can allocate beds or view block layouts under the **Rooms** section.`;

      return { reply, intent: 'room.total' };
    } catch (err) {
      console.error('Error in handleTotalRooms:', err);
      return { reply: "Could not retrieve total rooms summary.", intent: 'room.total' };
    }
  }

  async handleStudentCount() {
    try {
      const studentCount = await User.countDocuments({ role: 'student' });
      const allocatedCount = await User.countDocuments({
        role: 'student',
        roomNumber: { $ne: null, $exists: true }
      });

      const reply = `🎓 **Hostel Student Strength:**\n\n` +
        `• **Total Registered Students:** **${studentCount}**\n` +
        `• **Allocated to Rooms:** **${allocatedCount}**\n` +
        `• **Pending Room Allotment:** **${Math.max(0, studentCount - allocatedCount)}**\n\n` +
        `Manage students or register new allotments in the **Students** tab.`;

      return { reply, intent: 'student.count' };
    } catch (err) {
      console.error('Error in handleStudentCount:', err);
      return { reply: "Could not fetch student count.", intent: 'student.count' };
    }
  }

  async handleStudentSearch(message) {
    try {
      const words = message.replace(/(find|search|where|is|student|who|room|staying)/gi, '').trim();
      if (!words || words.length < 2) {
        return await this.handleStudentCount();
      }

      const student = await User.findOne({
        name: { $regex: new RegExp(words, 'i') },
        role: 'student'
      });

      if (!student) {
        return {
          reply: `🔍 No student matching "${words}" was found in the database.`,
          intent: 'student.search'
        };
      }

      const reply = `👤 **Student Found:**\n\n` +
        `• **Name:** ${student.name}\n` +
        `• **Student ID:** ${student.studentId || 'N/A'}\n` +
        `• **Room Number:** ${student.roomNumber || 'Not Allotted Yet'}\n` +
        `• **Block:** ${student.block || 'N/A'}\n` +
        `• **Email:** ${student.email}\n` +
        `• **Phone:** ${student.phone || student.contact || 'N/A'}`;

      return { reply, intent: 'student.search' };
    } catch (err) {
      console.error('Error in handleStudentSearch:', err);
      return { reply: "Error searching student.", intent: 'student.search' };
    }
  }

  async handlePendingMaintenance() {
    try {
      const pendingIssues = await Maintenance.find({
        status: { $ne: 'Completed' }
      }).sort({ createdAt: -1 }).limit(6);

      const totalPending = await Maintenance.countDocuments({
        status: { $ne: 'Completed' }
      });

      if (totalPending === 0) {
        return {
          reply: "🎉 **All clear!** There are zero pending maintenance complaints across the hostel.",
          intent: 'maintenance.pending'
        };
      }

      let text = `🛠️ **Active Maintenance Requests (${totalPending} Open):**\n\n`;
      pendingIssues.forEach((issue, idx) => {
        const priorityBadge = issue.priority === 'Critical' || issue.priority === 'High' ? '🚨' : '🔧';
        text += `${idx + 1}. ${priorityBadge} **Room ${issue.roomNumber}** - ${issue.title || issue.issueType}\n   • Priority: **${issue.priority}** | Status: **${issue.status}**\n   • Note: ${issue.description}\n`;
      });

      if (totalPending > 6) {
        text += `\n...and ${totalPending - 6} more unresolved requests. Review all in the **Maintenance** tab.`;
      }

      return { reply: text, intent: 'maintenance.pending' };
    } catch (err) {
      console.error('Error in handlePendingMaintenance:', err);
      return { reply: "Unable to load maintenance records right now.", intent: 'maintenance.pending' };
    }
  }

  async handleUrgentMaintenance() {
    try {
      const urgentIssues = await Maintenance.find({
        priority: { $in: ['High', 'Critical'] },
        status: { $ne: 'Completed' }
      });

      if (!urgentIssues || urgentIssues.length === 0) {
        return {
          reply: "✅ There are no critical or high-priority maintenance emergencies right now.",
          intent: 'maintenance.urgent'
        };
      }

      let text = `🚨 **Urgent Maintenance Complaints (${urgentIssues.length} Critical):**\n\n`;
      urgentIssues.forEach((item, idx) => {
        text += `${idx + 1}. **Room ${item.roomNumber}** - ${item.issueType || item.title}\n   • Priority: **${item.priority}**\n   • Description: ${item.description}\n   • Status: ${item.status}\n`;
      });

      return { reply: text, intent: 'maintenance.urgent' };
    } catch (err) {
      console.error('Error in handleUrgentMaintenance:', err);
      return { reply: "Failed to fetch urgent maintenance tickets.", intent: 'maintenance.urgent' };
    }
  }
}

module.exports = new ChatbotService();
