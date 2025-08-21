import { config } from 'dotenv';
config();

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// In dev, load all the flows.
import './flows/extract-invoice-data';

genkit({
  plugins: [googleAI()],
});
