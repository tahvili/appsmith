export default {

	// Check if the user is logged in
	checkAuthentication: async () => {
		const token = appsmith.store.token;

		if (!token) {
			// If no token, redirect to the auth page
			navigateTo('Auth');
			return null;
		}

		try {
			// Decode and validate the token
			const user = await jsonwebtoken.verify(token, 'secret');

			if (!user || !user.id) {
				// If the token is invalid or user ID is missing, redirect to the auth page
				showAlert('Session expired. Please log in again.', 'error');
				navigateTo('Auth');
				return null;
			}

			// Token is valid, return the user ID
			return user.id;
		} catch (error) {
			// Handle token verification errors
			showAlert('Invalid session. Please log in again.', 'error');
			navigateTo('Auth');
			return null;
		}
	},

	// Fetch Submissions for the Logged-in User
	getUserSubmissions: async () => {
		const userId = await this.checkAuthentication();

		if (!userId) {
			// If the user is not authenticated, stop further actions
			return;
		}

		// Run the query to fetch submissions
		try {
			const submissions = await getApplications.run({ user_id: userId });
			return submissions;
		} catch (error) {
			showAlert('Error fetching submissions. Please try again.', 'error');
			return [];
		}
	}
}