import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables for quiz API');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type QuizType = 'name' | 'builder' | 'mixed';

interface QuizQuestion {
    yacht: {
        id: string;
        name: string;
        yacht_pictures: string[];
        builder: string;
        length_m: number;
        year_built: number;
        max_speed_kn: number;
        volume_gt: number;
        price?: number;
        owner?: string;
        detail_url: string;
    };
    options: string[];
    correctAnswer: string;
    questionId: string;
    questionType: QuizType;
}

// GET endpoint to get a quiz question
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const quizType: QuizType = (searchParams.get('type') as QuizType) || 'name';
    const minLength = searchParams.get('minLength') || null;
    const maxLength = searchParams.get('maxLength') || null;

    if (!supabase) {
        return NextResponse.json({ success: false, error: 'Database connection not configured.' }, { status: 500 });
    }

    try {
        const rpcParams: { limit_count: number; min_len?: number; max_len?: number } = { limit_count: 40 };

        if (minLength && !isNaN(parseInt(minLength))) {
            rpcParams.min_len = parseInt(minLength, 10);
        }
        if (maxLength && !isNaN(parseInt(maxLength))) {
            rpcParams.max_len = parseInt(maxLength, 10);
        }

        // Call the RPC function to get a pool of 40 random yachts
        let query = supabase.from('yachts_enhance_data').select('id, name, builder, yacht_pictures, length_m, year_built, max_speed_kn, volume_gt, price, owner, detail_url').not('yacht_pictures', 'is', null).filter('yacht_pictures', 'neq', '{}').not('name', 'is', null).not('builder', 'is', null).limit(40);

        if (minLength) {
            query = query.gte('length_m', parseInt(minLength, 10));
        }
        if (maxLength) {
            query = query.lte('length_m', parseInt(maxLength, 10));
        }

        const { data: yachts, error: rpcError } = await query;

        if (rpcError) throw new Error(`Failed to fetch yachts via RPC: ${rpcError.message}`);
        if (!yachts || yachts.length < 4) throw new Error('Not enough yachts in the database for a quiz.');

        let allBuilders: string[] = [];
        if (quizType === 'builder' || quizType === 'mixed') {
            const { data: buildersData, error: buildersError } = await supabase.rpc('get_distinct_builders');
            if (buildersError) throw new Error(`Failed to fetch builders: ${buildersError.message}`);
            allBuilders = buildersData.map((b: { builder: string }) => b.builder);
        }

        const questions: QuizQuestion[] = [];
        let yachtPool = [...yachts];

        for (let i = 0; i < 10; i++) {
            const currentQuizType = quizType === 'mixed' ? (Math.random() > 0.5 ? 'name' : 'builder') : quizType;
            if (yachtPool.length < 4) break; // Stop if we run out of yachts

            const questionYachts: (typeof yachts[number])[] = [];
            for (let j = 0; j < 4; j++) {
                const randomIndex = Math.floor(Math.random() * yachtPool.length);
                const selectedYacht = yachtPool.splice(randomIndex, 1)[0];
                if (selectedYacht) {
                    questionYachts.push(selectedYacht);
                }
            }

            if (questionYachts.length < 4) continue; // Skip if we couldn't get 4 yachts

            const correctYacht = questionYachts[0];
            if (!correctYacht || !correctYacht.name) continue;

            let question: QuizQuestion | null = null;

            if (currentQuizType === 'name') {
                const options = questionYachts.map(y => y.name).filter((name): name is string => name !== null);
                if (options.length < 4) continue;
                const shuffledOptions = options.sort(() => Math.random() - 0.5);
                question = {
                    yacht: {
                        ...correctYacht,
                        yacht_pictures: correctYacht.yacht_pictures || [],
                    },
                    options: shuffledOptions,
                    correctAnswer: correctYacht.name,
                    questionId: `quiz_name_${Date.now()}_${i}`,
                    questionType: 'name',
                };
            } else if (currentQuizType === 'builder' && correctYacht.builder) {
                const correctAnswer = correctYacht.builder;
                const wrongBuilders = allBuilders.filter(b => b !== correctAnswer);
                const options = [correctAnswer];
                while (options.length < 4 && wrongBuilders.length > 0) {
                    const randomIndex = Math.floor(Math.random() * wrongBuilders.length);
                    options.push(wrongBuilders.splice(randomIndex, 1)[0]);
                }

                if (options.length < 4) continue;
                const shuffledOptions = options.sort(() => Math.random() - 0.5);

                question = {
                    yacht: {
                        ...correctYacht,
                        yacht_pictures: correctYacht.yacht_pictures || [],
                    },
                    options: shuffledOptions,
                    correctAnswer: correctAnswer,
                    questionId: `quiz_builder_${Date.now()}_${i}`,
                    questionType: 'builder',
                };
            }

            if (question) {
                questions.push(question);
            }
        }

        if (questions.length === 0) throw new Error('Could not generate any quiz questions.');

        return NextResponse.json({ success: true, questions });
    } catch (error) {
        console.error('Quiz API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate quiz question' },
            { status: 500 }
        );
    }
}

