export default {

	defaultTab: 'Sign In',
	Token: '',

	initializeDefaultTab: () => {
		// Use Appsmith's URL query parameters
		const queryParams = appsmith.URL.queryParams;

		if (queryParams.reset) {
			this.setDefaultTab('Reset Password');
			this.Token = queryParams.reset;
		}
		else if (queryParams.verify) {
			this.setDefaultTab('Sign In');
			this.Token = queryParams.verify;
			this.validateToken(this.Token);
		}
		else {
			this.setDefaultTab('Sign In');
		}
	},

	validateToken: async (Token) => {
		const [result] = await verifyToken.run({ token: Token });

		if (result) {
			// Token is valid, mark the email as verified
			await authenticateEmail.run({ id: result.id });

			// Show a success message
			showAlert('Email verified successfully!', 'success');
		} else {
			// Token is invalid
			showAlert('Invalid or expired token', 'error');
		}
	},

	setDefaultTab: (newTab) => {
		this.defaultTab = newTab;
	},

	generatePasswordHash: async () => {
		return dcodeIO.bcrypt.hashSync(input_register_password.text, 10);
	},

	generatePasswordHashForgot: async () => {
		return dcodeIO.bcrypt.hashSync(input_password_reset.text, 10);
	},

	verifyHash: async (password, hash) => {
		return dcodeIO.bcrypt.compareSync(password, hash)
	},

	createToken: async (user) => {
		return jsonwebtoken.sign(user, 'secret', {expiresIn: 60*60});
	},

	sendAuthEmail: async (email, token) => {
		await sendAuthEmail.run({
			email: email,
			authToken: token
		});
	},

	signIn: async () => {
		const password = input_password.text;

		const [user] = await findUserByEmail.run();

		if (user && await this.verifyHash(password, user?.password)) {
			storeValue('token', await this.createToken(user))
				.then(() => updateLogin.run({
				id: user.id
			}))
				.then(() => navigateTo('Application'))
		} else {
			return showAlert('Invalid email/password combination', 'error');
		}
	},

	register: async () => {
		const passwordHash = await this.generatePasswordHash();
		const authToken = await this.createToken({ email: input_register_email.text });

		const [check] = await findUserForRegister.run();

		if(check){
			return showAlert('User already exist with this email address', 'error');
		}

		// Create user in the `client` table
		const [user] = await createClient.run({
			email: input_register_email.text,
			passwordHash: passwordHash
		});

		if (user) {
			// Create corresponding profile in the `profile` table
			await createProfile.run({
				id: user.id,
				firstName: input_register_firstname.text,
				lastName: input_register_lastname.text,
				authToken: authToken
			});

			// Email the auth token to the user
			await this.sendAuthEmail(input_register_email.text, authToken);

			showAlert('Registration Success. Check your email for the next steps', 'success');
		} else {
			return showAlert('Error creating new user', 'error');
		}
	},

	forgotPassword: async () => {
		const [user] = await findUserForPassword.run();

		if (user) {
			const resetToken = await this.createToken({ email: user.email });
			await updatePasswordResetToken.run({
				resetToken: resetToken,
				id: user.id
			});

			// Send reset token via email
			await sendPasswordResetEmail.run({
				email: user.email,
				resetToken: resetToken
			});

			showAlert('Password reset email sent. Please check your inbox', 'success');
		} else {
			showAlert('Email not found', 'error');
		}
	},

	resetPassword: async () => {
		const passwordHash = await this.generatePasswordHashForgot();

		const [user] = await findUserByResetToken.run({
			token: this.Token
		});

		if (user) {
			await resetUserPassword.run({
				password: passwordHash,
				id: user.id
			});

			showAlert('Password has been reset successfully', 'success');
		} else {
			showAlert('Invalid or expired token', 'error');
		}
	}
}