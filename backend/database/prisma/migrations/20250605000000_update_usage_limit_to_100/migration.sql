-- Migration to update usage limit from 5 to 100 for free users
-- Update existing users with free plan to have usage limit of 100
UPDATE "User" SET "usageLimit" = 100 WHERE "plan" = 'free' AND "usageLimit" = 5;
