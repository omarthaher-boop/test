import React, { useRef, useEffect } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { RoutePoint } from '../../types';
import { colors } from '../../theme';

interface TripMapProps {
  routePoints: RoutePoint[];
  shortestRoutePolyline?: string | null;
  showShortest?: boolean;
  style?: object;
  interactive?: boolean;
}

const pointsToCoords = (points: RoutePoint[]) =>
  points.map(({ latitude, longitude }) => ({ latitude, longitude }));

const decodeShortest = (encoded: string) => {
  try {
    return polyline.decode(encoded).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
  } catch {
    return [];
  }
};

const getBoundingRegion = (points: { latitude: number; longitude: number }[]): Region | null => {
  if (points.length === 0) return null;
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat, 0.005) * 1.4,
    longitudeDelta: Math.max(maxLng - minLng, 0.005) * 1.4,
  };
};

export const TripMap: React.FC<TripMapProps> = ({
  routePoints,
  shortestRoutePolyline,
  showShortest = true,
  style,
  interactive = false,
}) => {
  const mapRef = useRef<MapView>(null);
  const coords = pointsToCoords(routePoints);
  const shortestCoords = shortestRoutePolyline ? decodeShortest(shortestRoutePolyline) : [];
  const allPoints = showShortest && shortestCoords.length > 0
    ? [...coords, ...shortestCoords]
    : coords;

  useEffect(() => {
    if (allPoints.length === 0 || !mapRef.current) return;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(allPoints, {
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
        animated: true,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [routePoints.length, shortestRoutePolyline]);

  const initialRegion = getBoundingRegion(allPoints);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion ?? {
          latitude: 48.1351,
          longitude: 11.582,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={false}
        rotateEnabled={false}
        showsUserLocation
        showsCompass={false}
        showsScale={false}
      >
        {/* Actual driven route */}
        {coords.length > 1 && (
          <Polyline
            coordinates={coords}
            strokeColor={colors.mapRoute}
            strokeWidth={4}
          />
        )}

        {/* Shortest route overlay */}
        {showShortest && shortestCoords.length > 1 && (
          <Polyline
            coordinates={shortestCoords}
            strokeColor={colors.mapShortest}
            strokeWidth={2.5}
            lineDashPattern={[10, 6]}
          />
        )}

        {/* Start marker */}
        {coords.length > 0 && (
          <Marker
            coordinate={coords[0]}
            title="Start"
            pinColor={colors.mapStart}
          />
        )}

        {/* End marker */}
        {coords.length > 1 && (
          <Marker
            coordinate={coords[coords.length - 1]}
            title="Ziel"
            pinColor={colors.mapEnd}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e8eaf0',
  },
});
