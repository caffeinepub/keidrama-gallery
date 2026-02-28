import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type DramaEntry = {
    id : Text;
    owner : Principal;
    title : Text;
    mediaFiles : [Storage.ExternalBlob];
    rating : Nat;
    liked : Text;
    disliked : Text;
    createdAt : Time.Time;
  };

  module DramaEntry {
    public func compareByCreatedTime(entry1 : DramaEntry, entry2 : DramaEntry) : Order.Order {
      if (entry1.createdAt < entry2.createdAt) {
        #less;
      } else if (entry1.createdAt > entry2.createdAt) {
        #greater;
      } else {
        Text.compare(entry1.title, entry2.title);
      };
    };
  };

  let dramaEntries = Map.empty<Principal, Map.Map<Text, DramaEntry>>();
  let idCounters = Map.empty<Principal, Nat>();

  public shared ({ caller }) func createDramaEntry(title : Text, rating : Nat, liked : Text, disliked : Text, mediaFiles : [Storage.ExternalBlob]) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create drama entries");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let nextId = switch (idCounters.get(caller)) {
      case (null) { 0 };
      case (?currentId) { currentId };
    };

    let id = nextId.toText();
    let dramaEntry : DramaEntry = {
      id;
      owner = caller;
      title;
      mediaFiles;
      rating;
      liked;
      disliked;
      createdAt = Time.now();
    };

    let userEntries = switch (dramaEntries.get(caller)) {
      case (null) {
        let newEntries = Map.empty<Text, DramaEntry>();
        newEntries;
      };
      case (?entries) { entries };
    };

    userEntries.add(id, dramaEntry);
    dramaEntries.add(caller, userEntries);
    idCounters.add(caller, nextId + 1);

    id;
  };

  public query ({ caller }) func getDramaEntries() : async [DramaEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list their drama entries");
    };

    switch (dramaEntries.get(caller)) {
      case (null) { [] };
      case (?entries) {
        entries.values().toArray().sort(DramaEntry.compareByCreatedTime);
      };
    };
  };

  public query ({ caller }) func getDramaEntry(id : Text) : async DramaEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their drama entries");
    };

    switch (dramaEntries.get(caller)) {
      case (null) { Runtime.trap("Drama entry not found") };
      case (?entries) {
        switch (entries.get(id)) {
          case (null) { Runtime.trap("Drama entry not found") };
          case (?dramaEntry) { dramaEntry };
        };
      };
    };
  };

  public shared ({ caller }) func updateDramaEntry(id : Text, title : Text, rating : Nat, liked : Text, disliked : Text, mediaFiles : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update drama entries");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (dramaEntries.get(caller)) {
      case (null) { Runtime.trap("Drama entry not found") };
      case (?entries) {
        switch (entries.get(id)) {
          case (null) { Runtime.trap("Drama entry not found") };
          case (?dramaEntry) {
            let updatedEntry : DramaEntry = {
              id = dramaEntry.id;
              owner = dramaEntry.owner;
              title;
              mediaFiles;
              rating;
              liked;
              disliked;
              createdAt = dramaEntry.createdAt;
            };
            entries.add(id, updatedEntry);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteDramaEntry(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete drama entries");
    };

    switch (dramaEntries.get(caller)) {
      case (null) { Runtime.trap("Drama entry not found") };
      case (?userEntries) {
        if (not userEntries.containsKey(id)) {
          Runtime.trap("Drama entry not found");
        };
        userEntries.remove(id);
      };
    };
  };
};
