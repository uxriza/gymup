import type { Exercise, Workout } from "@/types";

export const defaultExercises: Exercise[] = [
  {
    "id": "bench-press",
    "name": "Bench Press",
    "category": "Chest",
    "targetSets": 4,
    "targetReps": 8,
    "isOptional": false,
    "notes": "Lay down on a bench, the bar should be directly above your eyes, the knees are somewhat angled and the feet are firmly on the floor. Concentrate, breath deeply and grab the bar more than shoulder wide. Bring it slowly do...",
    "equipment": [
      "Barbell",
      "Bench"
    ],
    "updatedAt": "2026-04-15T22:23:56.330863+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/192/Bench-press-1.png",
    "videoUrl": "https://wger.de/media/exercise-video/73/cfb72002-898f-443a-a124-a0bce8a2e6ad.MP4",
    "instructions": [
      "Lay down on a bench, the bar should be directly above your eyes, the knees are somewhat angled and the feet are firmly on the floor",
      "Concentrate, breath deeply and grab the bar more than shoulder wide",
      "Bring it slowly down till it briefly touches your chest at the height of your nipples",
      "If you train with a high weight it is advisable to have a *spotter* that can help you up if you can't lift the weight on your own"
    ]
  },
  {
    "id": "incline-bench-press-dumbbell",
    "name": "Incline Bench Press - Dumbbell",
    "category": "Chest",
    "targetSets": 3,
    "targetReps": 10,
    "isOptional": false,
    "notes": "* Bench should be angled anywhere from 30 to 45 degrees * Be sure to press dumbbells straight upward (perpendicular to the floor)",
    "equipment": [
      "Dumbbell",
      "Incline bench"
    ],
    "updatedAt": "2026-04-15T22:23:56.012930+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/16/Incline-press-1.png",
    "videoUrl": "https://wger.de/media/exercise-video/537/b9c937e9-daeb-42a9-be8e-7a77e368478c.MOV",
    "instructions": [
      "* Bench should be angled anywhere from 30 to 45 degrees * Be sure to press dumbbells straight upward (perpendicular to the floor)"
    ]
  },
  {
    "id": "shoulder-press-dumbbells",
    "name": "Shoulder Press, Dumbbells",
    "category": "Shoulders",
    "targetSets": 3,
    "targetReps": 10,
    "isOptional": false,
    "notes": "Sit on a bench, the back rest should be almost vertical. Take two dumbbells and bring them up to shoulder height, the palms and the elbows point during the whole exercise to the front. Press the weights up, at the highes...",
    "equipment": [
      "Dumbbell"
    ],
    "updatedAt": "2026-04-15T22:23:55.654931+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/123/dumbbell-shoulder-press-large-1.png",
    "videoUrl": "https://wger.de/media/exercise-video/567/64f33c19-1d96-4b7c-af17-6c6a4941c614.MOV",
    "instructions": [
      "Sit on a bench, the back rest should be almost vertical",
      "Take two dumbbells and bring them up to shoulder height, the palms and the elbows point during the whole exercise to the front",
      "Press the weights up, at the highest point they come very near but don't touch",
      "Go slowly down and repeat."
    ]
  },
  {
    "id": "lateral-raises",
    "name": "Lateral Raises",
    "category": "Shoulders",
    "targetSets": 3,
    "targetReps": 12,
    "isOptional": true,
    "notes": "This exercise works the deltoid muscle of the shoulder. The movement starts with the arms straight, and the hands holding weights at the sides or in front of the body. Body is in a slight forward-leaning position with hi...",
    "equipment": [
      "Dumbbell"
    ],
    "updatedAt": "2026-04-15T22:23:55.570498+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png",
    "videoUrl": "https://wger.de/media/exercise-video/348/de69928a-8a35-4096-821c-1f46de5e0e03.MOV",
    "instructions": [
      "This exercise works the deltoid muscle of the shoulder",
      "The movement starts with the arms straight, and the hands holding weights at the sides or in front of the body",
      "Body is in a slight forward-leaning position with hips and knees bent a little",
      "Arms are kept straight or slightly bent, and raised through an arc of movement in the coronal plane that terminates when the hands are at approximately shoulder height"
    ]
  },
  {
    "id": "dips",
    "name": "Dips",
    "category": "Chest",
    "targetSets": 3,
    "targetReps": 8,
    "isOptional": true,
    "notes": "A dip is an upper-body strength exercise. Narrow, shoulder-width dips primarily train the triceps, with major synergists being the anterior deltoid, the pectoralis muscles (sternal, clavicular, and minor), and the rhombo...",
    "equipment": [
      "none (bodyweight exercise)"
    ],
    "updatedAt": "2026-04-15T22:23:54.045674+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/194/34600351-8b0b-4cb0-8daa-583537be15b0.png",
    "videoUrl": "https://wger.de/media/exercise-video/194/d039ec90-474d-47a9-a3ad-bf0b00828c82.MP4",
    "instructions": [
      "A dip is an upper-body strength exercise",
      "Narrow, shoulder-width dips primarily train the triceps, with major synergists being the anterior deltoid, the pectoralis muscles (sternal, clavicular, and minor), and the rhomboid muscles of the back (in that order).[1] Wide arm training places additional emphasis on the pectoral muscles, similar in respect to the way a wide grip bench press would focus more on the pectorals and less on the triceps."
    ]
  },
  {
    "id": "benchpress-dumbbells",
    "name": "Benchpress Dumbbells",
    "category": "Chest",
    "targetSets": 3,
    "targetReps": 10,
    "isOptional": true,
    "notes": "The movement is very similar to benchpressing with a barbell, however, the weight is brought down to the chest at a lower point. Hold two dumbbells and lay down on a bench. Hold the weights next to the chest, at the heig...",
    "equipment": [
      "Bench",
      "Dumbbell"
    ],
    "updatedAt": "2026-04-15T22:23:56.016514+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/97/Dumbbell-bench-press-1.png",
    "videoUrl": "https://wger.de/media/exercise-video/75/080c799b-8afd-4130-8d72-9cef0cd79f54.MOV",
    "instructions": [
      "The movement is very similar to benchpressing with a barbell, however, the weight is brought down to the chest at a lower point",
      "Hold two dumbbells and lay down on a bench",
      "Hold the weights next to the chest, at the height of your nipples and press them up till the arms are stretched",
      "Let the weight slowly and controlled down."
    ]
  },
  {
    "id": "pull-ups",
    "name": "Pull-ups",
    "category": "Back",
    "targetSets": 4,
    "targetReps": 8,
    "isOptional": false,
    "notes": "Grab the pull up bar with a wide grip, the body is hanging freely. Keep your chest out and pull yourself up till your chin reaches the bar or it touches your neck, if you want to pull behind you. Go with a slow and contr...",
    "equipment": [
      "Pull-up bar"
    ],
    "updatedAt": "2026-04-15T22:23:56.751242+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/475/b0554016-16fd-4dbe-be47-a2a17d16ae0e.jpg",
    "videoUrl": "https://wger.de/media/exercise-video/475/83067ffe-ccb9-4e22-8507-5131b211ce74.MOV",
    "instructions": [
      "Grab the pull up bar with a wide grip, the body is hanging freely",
      "Keep your chest out and pull yourself up till your chin reaches the bar or it touches your neck, if you want to pull behind you",
      "Go with a slow and controlled movement down, always keeping the chest out."
    ]
  },
  {
    "id": "pull-ups-on-machine",
    "name": "Pull Ups on Machine",
    "category": "Back",
    "targetSets": 3,
    "targetReps": 10,
    "isOptional": true,
    "notes": "Ikuti gerakan dengan kontrol penuh dan jaga tempo stabil.",
    "equipment": [],
    "updatedAt": "2026-04-15T22:23:55.167004+02:00",
    "videoUrl": "https://wger.de/media/exercise-video/477/2e23bb52-2782-40c8-bf88-fa2d2e2a9a0d.MOV",
    "instructions": [
      "Atur posisi awal dengan stabil sebelum mulai bergerak.",
      "Lakukan gerakan dengan tempo terkontrol dan jaga napas tetap stabil.",
      "Hentikan set jika form mulai berantakan atau terasa nyeri."
    ]
  },
  {
    "id": "rowing-seated-narrow-grip",
    "name": "Rowing seated, narrow grip",
    "category": "Back",
    "targetSets": 4,
    "targetReps": 10,
    "isOptional": false,
    "notes": "* Tighten muscles * Controlled movement * Slow movement * Keep upper body upright * Do not lean back * Pull toward chest",
    "equipment": [],
    "updatedAt": "2026-04-15T22:23:55.425143+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/512/b938437e-ff00-4679-9036-acb41bb28bbd.png",
    "videoUrl": "https://wger.de/media/exercise-video/512/fff4c294-93f0-4926-b3a2-bf59ad4afaa5.MOV",
    "instructions": [
      "* Tighten muscles * Controlled movement * Slow movement * Keep upper body upright * Do not lean back * Pull toward chest"
    ]
  },
  {
    "id": "facepull",
    "name": "Facepull",
    "category": "Shoulders",
    "targetSets": 3,
    "targetReps": 15,
    "isOptional": true,
    "notes": "Attach a rope to a pulley station set at about chest level. Step back so you're supporting the weight with arms completely outstretched and assume a staggered (one foot forward) stance. Bend the knees slightly for a stab...",
    "equipment": [],
    "updatedAt": "2026-04-15T22:23:54.320038+02:00",
    "videoUrl": "https://wger.de/media/exercise-video/222/245a824b-cd39-45f2-b251-2c0b7efead0d.MOV",
    "instructions": [
      "Attach a rope to a pulley station set at about chest level",
      "Step back so you're supporting the weight with arms completely outstretched and assume a staggered (one foot forward) stance",
      "Bend the knees slightly for a stable base",
      "Retract the scapulae (squeeze your partner's finger with your shoulder blades) and pull the center of the rope slightly up towards the face"
    ]
  },
  {
    "id": "biceps-curls-with-barbell",
    "name": "Biceps Curls With Barbell",
    "category": "Arms",
    "targetSets": 3,
    "targetReps": 10,
    "isOptional": false,
    "notes": "Hold the Barbell shoulder-wide, the back is straight, the shoulders slightly back, the arms are streched. Bend the arms, bringing the weight up, with a fast movement. Without pausing, let down the bar with a slow and con...",
    "equipment": [
      "Barbell"
    ],
    "updatedAt": "2026-04-15T22:23:55.375060+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/74/Bicep-curls-1.png",
    "videoUrl": "https://wger.de/media/exercise-video/91/483f4bff-e108-41f1-8e7b-0caf24952552.MOV",
    "instructions": [
      "Hold the Barbell shoulder-wide, the back is straight, the shoulders slightly back, the arms are streched",
      "Bend the arms, bringing the weight up, with a fast movement",
      "Without pausing, let down the bar with a slow and controlled movement",
      "Don't allow your body to swing during the exercise, all work is done by the biceps, which are the only mucles that should move (pay attention to the elbows)."
    ]
  },
  {
    "id": "hammer-curls",
    "name": "Hammer Curls",
    "category": "Arms",
    "targetSets": 3,
    "targetReps": 12,
    "isOptional": true,
    "notes": "- **Start:** Hold dumbbells at your sides with palms facing your torso. - **Curl:** Lift the weights toward your shoulders while maintaining the neutral grip (like holding a hammer). - **Squeeze:** Contract the biceps at...",
    "equipment": [
      "Dumbbell"
    ],
    "updatedAt": "2026-04-15T22:23:54.216768+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png",
    "videoUrl": "https://wger.de/media/exercise-video/272/df069052-2173-4f24-855f-a0eebe729f24.MOV",
    "instructions": [
      "- **Start:** Hold dumbbells at your sides with palms facing your torso. - **Curl:** Lift the weights toward your shoulders while maintaining the neutral grip (like holding a hammer). - **Squeeze:** Contract the biceps at the top without moving your elbows forward. - **Lower:** Slowly return to the starting position with full control."
    ]
  },
  {
    "id": "front-squats",
    "name": "Front Squats",
    "category": "Legs",
    "targetSets": 4,
    "targetReps": 8,
    "isOptional": false,
    "notes": "This variation of the squat trains the hamstrings and gluteus maximus. It also works the back extensors and abductors.",
    "equipment": [
      "Barbell"
    ],
    "updatedAt": "2026-04-15T22:23:55.585492+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/191/Front-squat-1-857x1024.png",
    "videoUrl": "https://wger.de/media/exercise-video/257/ad8ac7d9-b04d-415f-ae0e-837942ce2840.MOV",
    "instructions": [
      "This variation of the squat trains the hamstrings and gluteus maximus",
      "It also works the back extensors and abductors."
    ]
  },
  {
    "id": "romanian-deadlift",
    "name": "Romanian Deadlift",
    "category": "Legs",
    "targetSets": 3,
    "targetReps": 10,
    "isOptional": false,
    "notes": "DL from top to pos 2: https://www.youtube.com/watch?v=WtWtjViRsKo",
    "equipment": [
      "Barbell"
    ],
    "updatedAt": "2026-04-15T22:23:55.433530+02:00",
    "videoUrl": "https://wger.de/media/exercise-video/507/307e7276-a14d-4ea0-b579-f5b0dbc6f5af.MOV",
    "instructions": [
      "DL from top to pos 2: https://www.youtube.com/watch?v=WtWtjViRsKo"
    ]
  },
  {
    "id": "leg-press",
    "name": "Leg Press",
    "category": "Legs",
    "targetSets": 3,
    "targetReps": 10,
    "isOptional": false,
    "notes": "The leg press is a weight training exercise in which the individual pushes a weight or resistance away from them using their legs.",
    "equipment": [],
    "updatedAt": "2026-04-15T22:23:55.074837+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/371/d2136f96-3a43-4d4c-9944-1919c4ca1ce1.webp",
    "videoUrl": "https://wger.de/media/exercise-video/371/6aae16b4-01b9-4eb4-935c-3250f84d2c59.MOV",
    "instructions": [
      "The leg press is a weight training exercise in which the individual pushes a weight or resistance away from them using their legs."
    ]
  },
  {
    "id": "dumbbell-lunges-walking",
    "name": "Dumbbell Lunges Walking",
    "category": "Legs",
    "targetSets": 3,
    "targetReps": 12,
    "isOptional": true,
    "notes": "Take two dumbbells in your hands, stand straight, feet about shoulder wide. Take one long step so that the front knee is approximately forming a right angle. The back leg is streched, the knee is low but doesn't touch th...",
    "equipment": [
      "Dumbbell"
    ],
    "updatedAt": "2026-04-15T22:23:56.366370+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/113/Walking-lunges-1.png",
    "videoUrl": "https://wger.de/media/exercise-video/206/47a65c45-6fd1-4181-b71a-3a6c882e516b.MOV",
    "instructions": [
      "Take two dumbbells in your hands, stand straight, feet about shoulder wide",
      "Take one long step so that the front knee is approximately forming a right angle",
      "The back leg is streched, the knee is low but doesn't touch the ground. \"Complete\" the step by standing up and repeat the movement with the other leg."
    ]
  },
  {
    "id": "leg-curls-sitting",
    "name": "Leg Curls (sitting)",
    "category": "Legs",
    "targetSets": 3,
    "targetReps": 12,
    "isOptional": false,
    "notes": "Ikuti gerakan dengan kontrol penuh dan jaga tempo stabil.",
    "equipment": [],
    "updatedAt": "2026-04-15T22:23:53.335983+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/117/seated-leg-curl-large-1.png",
    "videoUrl": "https://wger.de/media/exercise-video/366/43df4b79-d4c3-4fbf-bcb5-e0d825b84120.MOV",
    "instructions": [
      "Atur posisi awal dengan stabil sebelum mulai bergerak.",
      "Lakukan gerakan dengan tempo terkontrol dan jaga napas tetap stabil.",
      "Hentikan set jika form mulai berantakan atau terasa nyeri."
    ]
  },
  {
    "id": "standing-calf-raises",
    "name": "Standing Calf Raises",
    "category": "Calves",
    "targetSets": 3,
    "targetReps": 15,
    "isOptional": true,
    "notes": "Get onto the calf raises machine, you should able to completely push your calves down. Stand straight, don't make a hollow back and don't bend your legs. Pull yourself up as high as you can. Make a small pause of 1 - 2 s...",
    "equipment": [],
    "updatedAt": "2026-04-15T22:23:56.267867+02:00",
    "imageUrl": "https://wger.de/media/exercise-images/622/9a429bd0-afd3-4ad0-8043-e9beec901c81.jpeg",
    "videoUrl": "https://wger.de/media/exercise-video/622/35b7b625-77fd-4c09-8c57-3ad0f2f23175.MOV",
    "instructions": [
      "Get onto the calf raises machine, you should able to completely push your calves down",
      "Stand straight, don't make a hollow back and don't bend your legs",
      "Pull yourself up as high as you can",
      "Make a small pause of 1 - 2 seconds and go slowly down."
    ]
  },
  {
    "id": "hip-thrust",
    "name": "Hip Thrust",
    "category": "Legs",
    "targetSets": 3,
    "targetReps": 10,
    "isOptional": true,
    "notes": "The bar should go directly on your upper thigh, directly below your crotch. Your feet should be directly under your knees. Push your hips up so that you form a straight line from your knees to your shoulders. Use a pad f...",
    "equipment": [
      "Barbell",
      "Bench"
    ],
    "updatedAt": "2026-04-15T22:23:54.183961+02:00",
    "videoUrl": "https://wger.de/media/exercise-video/294/45bacf4b-1bb6-4d47-8bd1-9f00eddd4019.MOV",
    "instructions": [
      "The bar should go directly on your upper thigh, directly below your crotch",
      "Your feet should be directly under your knees",
      "Push your hips up so that you form a straight line from your knees to your shoulders",
      "Use a pad for comfort."
    ]
  }
];

export const defaultWorkouts: Workout[] = [
  {
    "id": "push-foundation",
    "name": "Push Foundation",
    "dayOfWeek": "Monday",
    "exerciseIds": [
      "bench-press",
      "incline-bench-press-dumbbell",
      "shoulder-press-dumbbells",
      "lateral-raises",
      "dips",
      "benchpress-dumbbells"
    ]
  },
  {
    "id": "pull-foundation",
    "name": "Pull Foundation",
    "dayOfWeek": "Wednesday",
    "exerciseIds": [
      "pull-ups",
      "rowing-seated-narrow-grip",
      "facepull",
      "biceps-curls-with-barbell",
      "hammer-curls",
      "pull-ups-on-machine"
    ]
  },
  {
    "id": "legs-core",
    "name": "Legs + Core",
    "dayOfWeek": "Friday",
    "exerciseIds": [
      "front-squats",
      "romanian-deadlift",
      "leg-press",
      "dumbbell-lunges-walking",
      "leg-curls-sitting",
      "standing-calf-raises"
    ]
  },
  {
    "id": "full-body",
    "name": "Full Body",
    "dayOfWeek": "Flexible",
    "exerciseIds": [
      "bench-press",
      "pull-ups",
      "front-squats",
      "romanian-deadlift",
      "facepull",
      "hip-thrust"
    ]
  }
];
