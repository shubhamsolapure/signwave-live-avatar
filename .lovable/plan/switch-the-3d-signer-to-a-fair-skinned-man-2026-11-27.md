# Switch the 3D signer to a fair-skinned man

## What you will see
- The 3D Avatar shows a realistic, fair-skinned male character in place of the current woman.
- He stands with relaxed arms, and the existing sign movements (hello, thank you, help...) play on his arms, hands and fingers.
- Official ISLRTC videos stay the main, trusted way to show signs. The 3D character stays marked "experimental".

## Steps
1. Find a free (CC0) realistic male model with movable fingers, for example from the Quaternius "Universal Base Characters" pack. Check that it has finger joints and skin you can adjust, and set a fair skin tone if needed.
2. Upload it and replace the current model file the character uses.
3. Adjust the arm, elbow and finger directions for this model's skeleton, so he rests with arms down and lifts the right hand for "hello".
4. Check it in the browser: idle pose, "hello", and a two-hand sign like "help".
5. Remove the leftover test lines and save.

## Technical details
- `HumanSigner.tsx` is reused. Bone names get normalised (with or without the `mixamorig` prefix), and the axis and sign constants are retuned per rig.
- Body height is normalised to 1.7 m, and the camera framing stays upper-body.
- Any skin-material tint is applied in code, so the model file is not edited.
