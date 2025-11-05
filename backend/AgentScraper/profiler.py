import asyncio
from browser_use import Agent, ChatGoogle, Browser
from fastapi import HTTPException
from .schemas import CompanyProfile 

# Inisialisasi LLM
llm = ChatGoogle(model="gemini-flash-latest")

browser = Browser(
    executable_path='C:\\Users\\esun\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
    # user_data_dir='C:\\Users\\esun\\AppData\\Local\\Google\\Chrome\\User Data',
)


async def run_sift_agent(company_name: str) -> CompanyProfile:

    task_prompt = f"""
    Act as an expert sales intelligence analyst. Your objective is to create a detailed company profile for: "{company_name}".

    You have a **maximum of 25 total steps** to complete this entire task. Be efficient.

    **Plan:**
    1.  **Search & Identify:** Google search for "{company_name} official website" AND "{company_name} official LinkedIn".
    2.  **Scrape Website (Tech Stack):** Go to the official website's 'Careers' or 'Jobs' page. Find 3-5 key technologies.
    3.  **Scrape LinkedIn (Overview & Contacts):** Go to the official LinkedIn page. Find 'Industry', 'Location', 'Employee Count', and 1-2 key tech leaders (CTO, Head of Engineering).
    4.  **Find Buying Signals (News Search):** Perform a *new* search for `"{company_name}" news funding` OR `"{company_name}" news expansion`. Find 2-3 recent news articles.
    
    **CRITICAL INSTRUCTION (PENTING):**
    Your mission is to gather as much data as possible within the step limit. **If you cannot find a specific piece of information (e.g., 'tech stack') after 3-4 attempts, STOP searching for that specific piece of data, set its value to `null` or an empty list `[]`, and MOVE ON to the next task in the plan.** Do not get stuck. Returning partial data is better than returning nothing.
    
    You **must** return **only** the final JSON object.
    """
    
    agent = Agent(
        task=task_prompt,
        llm=llm,
        browser=browser,
        output_model_schema=CompanyProfile,
        max_steps=25
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