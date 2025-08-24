package com.yourcompany.ems.config;

import com.yourcompany.ems.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // TEMPORARILY SKIP ALL JWT PROCESSING FOR DEBUGGING
        logger.debug("JWT Filter: Skipping ALL JWT processing for debugging - Request: {} {}", request.getMethod(), request.getRequestURI());
        filterChain.doFilter(request, response);
        return;
        
        /*
        // Skip JWT processing for login endpoint and employee endpoints (temporarily for testing)
        if (request.getRequestURI().equals("/api/auth/login") && request.getMethod().equals("POST")) {
            logger.debug("Skipping JWT processing for login endpoint");
            filterChain.doFilter(request, response);
            return;
        }
        
        // Temporarily skip JWT processing for employee endpoints
        if (request.getRequestURI().startsWith("/api/employee/")) {
            logger.debug("Skipping JWT processing for employee endpoint: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");
        
        logger.debug("Processing request: {} {}", request.getMethod(), request.getRequestURI());
        logger.debug("Authorization header: {}", authorizationHeader != null ? "present" : "missing");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.debug("Extracted username from JWT: {}", username);
            } catch (Exception e) {
                logger.error("Error extracting username from JWT", e);
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                logger.debug("Loaded user details for {}: authorities={}", username, userDetails.getAuthorities());

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication set for user: {} with authorities: {}", username, userDetails.getAuthorities());
                } else {
                    logger.warn("JWT token validation failed for user: {}", username);
                }
            } catch (Exception e) {
                logger.error("Error loading user details for username: {}", username, e);
            }
        } else if (username == null) {
            logger.debug("No username extracted from JWT token");
        } else {
            logger.debug("Authentication already exists for user: {}", username);
        }
        
        filterChain.doFilter(request, response);
        */
    }
}
