General:
    - להבין את מבנה הניסוי
    - כמה סטים של משפטים בממוצע נסיין יצטרך
    - כמה נסיינים צפויים להיות
    - האם נסיין שמפסיק באמצע אמור להיות מסוגל להמשיך מאותה נקודה שהפסיק
    - האם הפורמט מבדיל בין שם הפועל לפועל
Frontend:
    - Examples Tab:
        - [] fix styling
        - [] make examples hardcoded
    - Instructions Tab:
        - [] replace lorem ipsum with instructions
    - Survey Form:
        - [] finish UI
        - [] move the unneeded logic from the examples tab to the survey's index.ts or util.ts
Backend:
    - Azure Blob Storage: storage to hold .json files with responses
        - [] create an instance to use for developmet
        - how would the file look like? what should be the structure?
        - should i update the file after every set of sentences the user creates questions for? or store it client side until the form is submitted
        - [] figure out if it's the most cost efficient solution
    - Azure Functions: serverless API to communicate with the storage and possibly some of the workload
        - [] create GET azure function to retrieve sentence sets from storage
        - [] create POST azure function to create and save .json files
    