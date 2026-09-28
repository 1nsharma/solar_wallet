/*
 * ============================================================
 * SolarSync - Main Application Entry Point
 * ============================================================
 * File: mobile_app/lib/main.dart
 * Purpose: App initialization, theme, routing, and auth state
 * ============================================================
 */

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';

import 'screens/consumer_dashboard.dart';
import 'screens/provider_dashboard.dart';
import 'screens/onboarding_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const SolarSyncApp(),
    ),
  );
}

class SolarSyncApp extends StatelessWidget {
  const SolarSyncApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'SolarSync',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            useMaterial3: true,
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF2E7D32),
              brightness: Brightness.light,
            ),
            textTheme: GoogleFonts.notoSansDevanagariTextTheme(),
            appBarTheme: const AppBarTheme(
              centerTitle: false,
              elevation: 0,
            ),
            cardTheme: CardTheme(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          darkTheme: ThemeData(
            useMaterial3: true,
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF2E7D32),
              brightness: Brightness.dark,
            ),
            textTheme: GoogleFonts.notoSansDevanagariTextTheme(
              ThemeData.dark().textTheme,
            ),
          ),
          themeMode: themeProvider.themeMode,
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('hi', 'IN'),
            Locale('en', 'IN'),
          ],
          locale: const Locale('hi', 'IN'),
          home: const AppNavigator(),
        );
      },
    );
  }
}

class AppNavigator extends StatefulWidget {
  const AppNavigator({Key? key}) : super(key: key);

  @override
  State<AppNavigator> createState() => _AppNavigatorState();
}

class _AppNavigatorState extends State<AppNavigator> {
  bool _isLoading = true;
  bool _hasAcceptedAgreement = false;
  String? _userRole;
  String? _token;
  String? _deviceId;
  String? _userName;

  @override
  void initState() {
    super.initState();
    _checkAuthState();
  }

  Future<void> _checkAuthState() async {
    final prefs = await SharedPreferences.getInstance();
    
    setState(() {
      _hasAcceptedAgreement = prefs.getBool('agreement_accepted') ?? false;
      _token = prefs.getString('auth_token');
      _userRole = prefs.getString('user_role');
      _deviceId = prefs.getString('device_id');
      _userName = prefs.getString('user_name');
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // If not accepted agreement, show onboarding
    if (!_hasAcceptedAgreement) {
      return OnboardingScreen(
        onAgreementAccepted: () async {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setBool('agreement_accepted', true);
          setState(() => _hasAcceptedAgreement = true);
        },
      );
    }

    // If no token, show login
    if (_token == null) {
      return _buildLoginScreen();
    }

    // Show appropriate dashboard based on role
    if (_userRole == 'provider') {
      return ProviderDashboard(
        deviceId: _deviceId ?? '',
        token: _token!,
        userName: _userName ?? 'प्रदाता',
      );
    }

    return ConsumerDashboard(
      deviceId: _deviceId ?? '',
      token: _token!,
      userName: _userName ?? 'उपभोक्ता',
    );
  }

  Widget _buildLoginScreen() {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.wb_sunny, size: 64, color: Color(0xFF2E7D32)),
              const SizedBox(height: 16),
              Text(
                'SolarSync',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF2E7D32),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'स्वच्छ ऊर्जा, पारदर्शी साझाकरण',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 48),
              // Login form would go here
              ElevatedButton(
                onPressed: () {
                  // Navigate to login
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('लॉगिन करें', style: TextStyle(fontSize: 16)),
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () {
                  // Navigate to register
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF2E7D32),
                  padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('नया खाता बनाएँ', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ==================== PROVIDERS ====================

class AuthProvider extends ChangeNotifier {
  String? _token;
  String? _userRole;
  String? _deviceId;
  String? _userName;

  String? get token => _token;
  String? get userRole => _userRole;
  String? get deviceId => _deviceId;
  String? get userName => _userName;
  bool get isLoggedIn => _token != null;

  Future<void> login(String token, String role, String deviceId, String name) async {
    _token = token;
    _userRole = role;
    _deviceId = deviceId;
    _userName = name;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('user_role', role);
    await prefs.setString('device_id', deviceId);
    await prefs.setString('user_name', name);
    
    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    _userRole = null;
    _deviceId = null;
    _userName = null;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_role');
    await prefs.remove('device_id');
    await prefs.remove('user_name');
    
    notifyListeners();
  }
}

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.light;

  ThemeMode get themeMode => _themeMode;

  void toggleTheme() {
    _themeMode = _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
  }
}
