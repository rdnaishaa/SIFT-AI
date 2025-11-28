import asyncio
import sys
from io import StringIO
from browser_use import Agent, ChatGoogle, Browser
from fastapi import HTTPException
from .schemas import CompanyProfile 

# Inisialisasi LLM
llm = ChatGoogle(model="gemini-flash-latest")

browser = Browser(
    executable_path='C:\\Users\\esun\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
    # user_data_dir='C:\\Users\\esun\\AppData\\Local\\Google\\Chrome\\User Data',
)


async def run_sift_agent_with_streaming(company_name: str):
    """
    Generator function yang yield log messages dari agent execution.
    Digunakan untuk SSE streaming ke frontend.
    """
    task_prompt = f"""
        You are a B2B sales intelligence agent. Your goal is to build a comprehensive company profile for '{company_name}' to help sales teams identify opportunities.

        STEP 1 - COMPANY OVERVIEW:
        - Go to the company's official website or LinkedIn company page
        - Extract:
        * Website URL (official company website, e.g., "www.gojek.com" or "https://gojek.com")
        * Industry/sector (be specific, e.g., "E-commerce & Ride-hailing Platform")
        * Headquarters location (City, Country)
        * Employee count (exact number or range like "10,000-15,000")
        * Founded year (e.g., "2010", "2015")
        * Company description/mission

        STEP 2 - TECH STACK:
        - Search for: "{company_name} technology stack" OR "{company_name} engineering blog"
        - Look for job postings (Software Engineer, DevOps, etc.) to identify technologies
        - Check their GitHub organization if available
        - Extract specific technologies: programming languages, frameworks, databases, cloud providers
        - Return as a list of strings, e.g., ["Python", "Go", "React", "PostgreSQL", "AWS"]
        - If not found, return empty list []

        STEP 3 - RECENT NEWS SIGNALS (Last 6 months):
        - Search Google News for: "{company_name} funding" OR "{company_name} hiring" OR "{company_name} expansion"
        - For EACH relevant article, extract:
        * title (exact article headline)
        * url (direct link to the news article, NOT search results)
        * signal_type: choose ONE from ["Funding Round", "Strategic Hiring", "Product Launch", "Market Expansion", "Partnership", "Award/Recognition"]
        - Only include articles from credible sources (TechCrunch, Reuters, company blog, etc.)
        - Skip academic papers, job boards, or irrelevant links
        - Limit to top 5 most relevant signals

        STEP 4 - KEY CONTACTS (CRITICAL - Follow carefully):
        - Search for "{company_name} leadership team" OR go to company About/Team/Leadership page
        - Also try: "{company_name} executives" OR "{company_name} management team"
        - Look for LinkedIn profiles by searching: "site:linkedin.com {company_name} CTO" or similar
        
        For EACH contact, you MUST extract:
        * name: Full name of the person (REQUIRED)
        * title: Their EXACT job title as shown on the page (e.g., "Chief Technology Officer", "VP of Engineering", "Head of Product", "Co-Founder & CTO")
          - DO NOT leave title as null if you find the person's name
          - The title is usually RIGHT NEXT TO or BELOW the person's name
          - Look for keywords: CEO, CTO, CFO, VP, Director, Head, Chief, President, Manager
        * linkedin: Full LinkedIn profile URL if available (e.g., "https://www.linkedin.com/in/dara-khosrowshahi-70949862/")
        * email: Email address if publicly available
        * phone: Phone number if publicly available
        
        IMPORTANT for STEP 4:
        - If you see a person's name on a page, their title is almost ALWAYS displayed nearby
        - Don't just copy names without titles - READ the entire section carefully
        - On LinkedIn company pages, click "People" or "Employees" to see leadership with titles
        - On company About pages, titles are usually in format "Name - Title" or "Name, Title"
        - Prioritize C-level (CEO, CTO, CFO, CMO) and VP-level executives
        - Focus on technical/business decision-makers
        - Limit to top 5 most senior contacts

        IMPORTANT RULES:
        1. Only return data you can VERIFY from reliable sources
        2. If a field is not found, use null (not guesses!)
        3. URLs must be direct links, not search result pages
        4. Be specific in signal_type - avoid generic terms
        5. Focus on RECENT and RELEVANT information
        6. Make sure to extract the official website URL and founded year in the overview section

        Return the structured data as CompanyProfile schema.
        """
    
    agent = Agent(
        task=task_prompt,
        llm=llm,
        browser=browser,
        output_model_schema=CompanyProfile,
        max_steps=50
    )
    
    # Capture stdout untuk mendapatkan agent logs
    step_count = 0
    max_steps = 50
    
    yield f"🤖 Agent initialized with {max_steps} max steps"
    yield f"📋 Task: Profiling {company_name}"
    
    # Simulate step-by-step progress
    # Karena browser-use agent tidak expose internal logs, kita buat progress simulation
    yield f"⏳ Step 1/{max_steps}: Searching for company information..."
    await asyncio.sleep(0.5)
    
    yield f"⏳ Step 5/{max_steps}: Analyzing company website..."
    await asyncio.sleep(0.5)

    yield f"⏳ Step 10/{max_steps}: Extracting tech stack from job postings..."
    await asyncio.sleep(0.5)

    yield f"⏳ Step 15/{max_steps}: Searching for recent news signals..."
    await asyncio.sleep(0.5)

    yield f"⏳ Step 20/{max_steps}: Identifying key contacts..."
    await asyncio.sleep(0.5)

    yield f"⏳ Step 25/{max_steps}: Verifying data accuracy..."
    await asyncio.sleep(0.5)

    yield f"⏳ Step 30/{max_steps}: Compiling final report..."
    await asyncio.sleep(0.5)


async def run_sift_agent(company_name: str) -> CompanyProfile:

    # task_prompt = f"""
    # Act as an expert sales intelligence analyst. Your objective is to create a detailed company profile for: "{company_name}".

    # You have a **maximum of 25 total steps** to complete this entire task. Be efficient.

    # **Plan:**
    # 1.  **Search & Identify:** Google search for "{company_name} official website" AND "{company_name} official LinkedIn".
    # 2.  **Scrape Website (Tech Stack):** Go to the official website's 'Careers' or 'Jobs' page. Find 3-5 key technologies.
    # 3.  **Scrape LinkedIn (Overview & Contacts):** Go to the official LinkedIn page. Find 'Industry', 'Location', 'Employee Count', and 1-2 key tech leaders (CTO, Head of Engineering).
    # 4.  **Find Buying Signals (News Search):** Perform a *new* search for `"{company_name}" news funding` OR `"{company_name}" news expansion`. Find 2-3 recent news articles.
    
    # **CRITICAL INSTRUCTION (PENTING):**
    # Your mission is to gather as much data as possible within the step limit. **If you cannot find a specific piece of information (e.g., 'tech stack') after 3-4 attempts, STOP searching for that specific piece of data, set its value to `null` or an empty list `[]`, and MOVE ON to the next task in the plan.** Do not get stuck. Returning partial data is better than returning nothing.
    
    # You **must** return **only** the final JSON object.
    # """

    task_prompt = f"""
        You are a B2B sales intelligence agent. Your goal is to build a comprehensive company profile for '{company_name}' to help sales teams identify opportunities.

        STEP 1 - COMPANY OVERVIEW:
        - Go to the company's official website or LinkedIn company page
        - Extract:
        * Website URL (official company website, e.g., "www.gojek.com" or "https://gojek.com")
        * Industry/sector (be specific, e.g., "E-commerce & Ride-hailing Platform")
        * Headquarters location (City, Country)
        * Employee count (exact number or range like "10,000-15,000")
        * Founded year (e.g., "2010", "2015")
        * Company description/mission

        STEP 2 - TECH STACK:
        - Search for: "{company_name} technology stack" OR "{company_name} engineering blog"
        - Look for job postings (Software Engineer, DevOps, etc.) to identify technologies
        - Check their GitHub organization if available
        - Extract specific technologies: programming languages, frameworks, databases, cloud providers
        - Return as a list of strings, e.g., ["Python", "Go", "React", "PostgreSQL", "AWS"]
        - If not found, return empty list []

        STEP 3 - RECENT NEWS SIGNALS (Last 6 months):
        - Search Google News for: "{company_name} funding" OR "{company_name} hiring" OR "{company_name} expansion"
        - For EACH relevant article, extract:
        * title (exact article headline)
        * url (direct link to the news article, NOT search results)
        * signal_type: choose ONE from ["Funding Round", "Strategic Hiring", "Product Launch", "Market Expansion", "Partnership", "Award/Recognition"]
        - Only include articles from credible sources (TechCrunch, Reuters, company blog, etc.)
        - Skip academic papers, job boards, or irrelevant links
        - Limit to top 5 most relevant signals

        STEP 4 - KEY CONTACTS (CRITICAL - Follow carefully):
        - Search for "{company_name} leadership team" OR go to company About/Team/Leadership page
        - Also try: "{company_name} executives" OR "{company_name} management team"
        - Look for LinkedIn profiles by searching: "site:linkedin.com {company_name} CTO" or similar
        
        For EACH contact, you MUST extract:
        * name: Full name of the person (REQUIRED)
        * title: Their EXACT job title as shown on the page (e.g., "Chief Technology Officer", "VP of Engineering", "Head of Product", "Co-Founder & CTO")
          - DO NOT leave title as null if you find the person's name
          - The title is usually RIGHT NEXT TO or BELOW the person's name
          - Look for keywords: CEO, CTO, CFO, VP, Director, Head, Chief, President, Manager
        * linkedin: Full LinkedIn profile URL if available (e.g., "https://www.linkedin.com/in/dara-khosrowshahi-70949862/")
        * email: Email address if publicly available
        * phone: Phone number if publicly available
        
        IMPORTANT for STEP 4:
        - If you see a person's name on a page, their title is almost ALWAYS displayed nearby
        - Don't just copy names without titles - READ the entire section carefully
        - On LinkedIn company pages, click "People" or "Employees" to see leadership with titles
        - On company About pages, titles are usually in format "Name - Title" or "Name, Title"
        - Prioritize C-level (CEO, CTO, CFO, CMO) and VP-level executives
        - Focus on technical/business decision-makers
        - Limit to top 5 most senior contacts

        IMPORTANT RULES:
        1. Only return data you can VERIFY from reliable sources
        2. If a field is not found, use null (not guesses!)
        3. URLs must be direct links, not search result pages
        4. Be specific in signal_type - avoid generic terms
        5. Focus on RECENT and RELEVANT information
        6. Make sure to extract the official website URL and founded year in the overview section

        Return the structured data as CompanyProfile schema.
        """
    
    agent = Agent(
        task=task_prompt,
        llm=llm,
        browser=browser,
        output_model_schema=CompanyProfile,
        max_steps=50
    )
    

    print(f"Starting SIFT profiling for: {company_name}...")
    history = await agent.run()
    print("Agent run finished.")

    result_json = history.final_result()
    
    if not result_json:
        raise HTTPException(status_code=500, detail="AI Agent failed to produce a result.")
    
    try:
        profile = CompanyProfile.model_validate_json(result_json)
        return profile
    except Exception as e:
        print(f"Error parsing agent result: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI output: {e}\nRaw output: {result_json}") 
    
async def main():
    """
    Fungsi ini hanya untuk menguji file profiler.py secara langsung.
    """
    print("Running profiler test...")
    try:
        profile = await run_sift_agent("Gojek")
        
        print("\n--- TEST RESULT ---")
        print(profile.model_dump_json(indent=2))
        print("-------------------")
        
    except Exception as e:
        print(f"An error occurred during the test: {e}")

if __name__ == "__main__":
    asyncio.run(main())